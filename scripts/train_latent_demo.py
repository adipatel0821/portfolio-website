"""Train the SynMedix WGAN-GP generator and export it for in-browser inference.

This produces the weights behind the latent-space explorer on the site. It is
committed for provenance: the demo ships real weights from a real training run,
and this is the script that produced them.

What it actually does
---------------------
1. Loads the SynMedix sample cohort (502 patients) from the GAN project.
2. Harmonises units using that project's own normaliser (F->C, lb->kg,
   umol/L->mg/dL, mmol/L->mg/dL) and splits the "SYS-DIA" blood-pressure string.
3. Trains the project's own Generator / Discriminator classes with its own
   WGAN-GP gradient penalty — the same architecture, configured smaller so the
   weights are small enough to ship to a browser.
4. Exports a flat float32 binary plus a JSON manifest with layer shapes,
   denormalisation ranges, and the real cohort's per-feature statistics so the
   UI can show generated values against the distribution they came from.

Honesty note
------------
This is trained on the 502-row *sample* cohort that ships with the SynMedix
repo, not on the ~10 GB clinical corpus behind the production system — that
data is not redistributable and never leaves its environment. The architecture,
the training procedure and the resulting weights are genuinely real; the demo
labels itself accordingly and must continue to.

Usage
-----
    python scripts/train_latent_demo.py --synmedix P:/Projects/GAN_GCP
"""

from __future__ import annotations

import argparse
import json
import struct
import sys
from pathlib import Path

import numpy as np
import pandas as pd
import torch
import torch.nn.functional as F

# ── Model sizing ──────────────────────────────────────────────────────────────
# Deliberately small. The production configuration uses latent 128 and hidden
# [256, 512, 512, 256]; that is ~1.5M parameters and far too heavy to ship.
# These are the same classes with smaller hyperparameters.
LATENT_DIM = 16
HIDDEN_DIMS = [96, 96]
CONDITION_DIM = 24
DIAGNOSIS_DIM = 12
NUM_AGE_BUCKETS = 10
NUM_GENDERS = 3

EPOCHS = 700
BATCH_SIZE = 64
CRITIC_STEPS = 3
LAMBDA_GP = 10.0
LR = 2e-4
SEED = 7

# Continuous features the demo generates, in a fixed order.
FEATURES: list[tuple[str, str, str]] = [
    # (column, display label, unit after harmonisation)
    ("vital_heart_rate", "Heart rate", "bpm"),
    ("vital_respiratory_rate", "Respiratory rate", "/min"),
    ("vital_spo2", "SpO₂", "%"),
    ("vital_temperature", "Temperature", "°C"),
    ("vital_weight", "Weight", "kg"),
    ("bp_systolic", "BP systolic", "mmHg"),
    ("bp_diastolic", "BP diastolic", "mmHg"),
    ("lab_glucose_value", "Glucose", "mg/dL"),
    ("lab_hba1c_value", "HbA1c", "%"),
    ("lab_creatinine_value", "Creatinine", "mg/dL"),
    ("lab_bun_value", "BUN", "mg/dL"),
    ("lab_hemoglobin_value", "Hemoglobin", "g/dL"),
    ("lab_platelets_value", "Platelets", "K/µL"),
    ("lab_potassium_value", "Potassium", "mmol/L"),
    ("lab_sodium_value", "Sodium", "mmol/L"),
    ("lab_wbc_value", "WBC", "K/µL"),
]


def harmonise(df: pd.DataFrame) -> pd.DataFrame:
    """Unit conversion and blood-pressure splitting.

    Mirrors the conversions in synmedix.data.normalizers. Done inline rather
    than through the class so this script stays runnable without constructing
    the full pipeline config.
    """
    out = pd.DataFrame(index=df.index)

    # Blood pressure arrives as "159-55".
    bp = df["vital_blood_pressure"].astype(str).str.extract(r"(\d+)\s*[-/]\s*(\d+)")
    out["bp_systolic"] = pd.to_numeric(bp[0], errors="coerce")
    out["bp_diastolic"] = pd.to_numeric(bp[1], errors="coerce")

    out["vital_heart_rate"] = pd.to_numeric(df["vital_heart_rate"], errors="coerce")
    out["vital_respiratory_rate"] = pd.to_numeric(df["vital_respiratory_rate"], errors="coerce")
    out["vital_spo2"] = pd.to_numeric(df["vital_spo2"], errors="coerce")

    # Temperature: rows are marked F or C.
    temp = pd.to_numeric(df["vital_temperature"], errors="coerce")
    is_f = df["vital_temperature_unit"].astype(str).str.upper().str.startswith("F")
    out["vital_temperature"] = np.where(is_f, (temp - 32.0) * 5.0 / 9.0, temp)

    # Weight: kg or lb.
    weight = pd.to_numeric(df["vital_weight"], errors="coerce")
    is_lb = df["vital_weight_unit"].astype(str).str.lower().str.startswith("lb")
    out["vital_weight"] = np.where(is_lb, weight * 0.45359237, weight)

    # Labs with alternate SI units in the source.
    def lab(col: str, unit_col: str, conversions: dict[str, float]) -> pd.Series:
        value = pd.to_numeric(df[col], errors="coerce")
        unit = df[unit_col].astype(str).str.lower().str.strip()
        result = value.copy()
        for src, factor in conversions.items():
            result = result.where(unit != src, value * factor)
        return result

    out["lab_glucose_value"] = lab(
        "lab_glucose_value", "lab_glucose_unit", {"mmol/l": 18.0182}
    )
    out["lab_creatinine_value"] = lab(
        "lab_creatinine_value", "lab_creatinine_unit", {"umol/l": 1 / 88.4}
    )
    for col in (
        "lab_hba1c_value",
        "lab_bun_value",
        "lab_hemoglobin_value",
        "lab_platelets_value",
        "lab_potassium_value",
        "lab_sodium_value",
        "lab_wbc_value",
    ):
        out[col] = pd.to_numeric(df[col], errors="coerce")

    return out


def build_conditions(df: pd.DataFrame) -> tuple[np.ndarray, np.ndarray, np.ndarray, list[str]]:
    """Age bucket, gender index, and a multi-hot over the most common ICD codes."""
    age = pd.to_numeric(df["age"], errors="coerce").fillna(50)
    # Decade buckets, clamped to the embedding table size.
    age_bucket = np.clip((age // 10).astype(int), 0, NUM_AGE_BUCKETS - 1).to_numpy()

    gender_map = {"M": 0, "F": 1}
    gender = df["gender"].astype(str).str.upper().map(gender_map).fillna(2).astype(int).to_numpy()

    # fillna before split: pandas 3 keeps NaN as a float through astype(str),
    # which then makes the split result non-iterable.
    codes = df["diagnosis_codes"].fillna("").astype(str).str.split(";")
    flat = [c.strip() for row in codes for c in row if c.strip() and c.strip() != "nan"]
    top = [c for c, _ in pd.Series(flat).value_counts().head(DIAGNOSIS_DIM).items()]

    diag = np.zeros((len(df), DIAGNOSIS_DIM), dtype=np.float32)
    for i, row in enumerate(codes):
        for c in row:
            c = c.strip()
            if c in top:
                diag[i, top.index(c)] = 1.0

    return age_bucket, gender, diag, top


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--synmedix",
        default="P:/Projects/GAN_GCP",
        help="Path to the SynMedix GAN project (source of the model classes and sample data).",
    )
    parser.add_argument("--out", default="public/models", help="Output directory.")
    parser.add_argument("--epochs", type=int, default=EPOCHS)
    args = parser.parse_args()

    root = Path(args.synmedix)
    sys.path.insert(0, str(root / "src"))

    from synmedix.model.discriminator import Discriminator  # noqa: E402
    from synmedix.model.generator import ConditionEmbedding, Generator  # noqa: E402
    from synmedix.model.losses import gradient_penalty  # noqa: E402

    torch.manual_seed(SEED)
    np.random.seed(SEED)

    # ── Data ─────────────────────────────────────────────────────────────────
    df = pd.read_csv(root / "data/sample/sample_patients.csv")
    feats = harmonise(df)
    cols = [c for c, _, _ in FEATURES]

    feats = feats[cols]

    # Each feature is individually 81–95% populated, but requiring all sixteen
    # at once leaves only ~7% of the cohort (0.85^16). Training on 68 rows is
    # far worse than median-imputing roughly 15% of cells, so impute and keep
    # the full cohort. The imputed fraction is recorded in the manifest.
    missing = feats.isna()
    missing_rate = float(missing.to_numpy().mean())
    complete_rows = int((~missing.any(axis=1)).sum())
    feats = feats.fillna(feats.median(numeric_only=True))
    df = df.reset_index(drop=True)
    feats = feats.reset_index(drop=True)
    print(
        f"cohort: {len(feats)} rows "
        f"({complete_rows} fully complete, {missing_rate:.1%} of cells median-imputed)"
    )

    raw = feats.to_numpy(dtype=np.float32)

    # Clip to the 1st–99th percentile before scaling so a single outlier does
    # not compress the entire usable range of a feature into a few percent.
    lo = np.percentile(raw, 1, axis=0)
    hi = np.percentile(raw, 99, axis=0)
    span = np.where(hi - lo < 1e-6, 1.0, hi - lo)
    clipped = np.clip(raw, lo, hi)
    # Scale to [-1, 1] to match the generator's tanh output head.
    scaled = ((clipped - lo) / span) * 2.0 - 1.0

    age_bucket, gender, diag, top_codes = build_conditions(df)

    X = torch.tensor(scaled, dtype=torch.float32)
    A = torch.tensor(age_bucket, dtype=torch.long)
    G = torch.tensor(gender, dtype=torch.long)
    D = torch.tensor(diag, dtype=torch.float32)

    num_continuous = X.shape[1]
    # The demo generates continuous features only; the categorical head is kept
    # (it is part of the architecture) but sized to 1 and ignored downstream.
    num_categorical = 1

    # ── Models ───────────────────────────────────────────────────────────────
    cond_embed = ConditionEmbedding(
        num_age_buckets=NUM_AGE_BUCKETS,
        num_genders=NUM_GENDERS,
        diagnosis_dim=DIAGNOSIS_DIM,
        condition_dim=CONDITION_DIM,
    )
    gen = Generator(
        latent_dim=LATENT_DIM,
        hidden_dims=HIDDEN_DIMS,
        num_continuous=num_continuous,
        num_categorical=num_categorical,
        condition_dim=CONDITION_DIM,
        dropout=0.1,
        use_batch_norm=True,
    )
    crit = Discriminator(
        hidden_dims=[96, 96],
        num_continuous=num_continuous,
        num_categorical=num_categorical,
        condition_dim=CONDITION_DIM,
        dropout=0.1,
        use_spectral_norm=True,
    )

    opt_g = torch.optim.Adam(
        list(gen.parameters()) + list(cond_embed.parameters()), lr=LR, betas=(0.5, 0.9)
    )
    opt_d = torch.optim.Adam(crit.parameters(), lr=LR, betas=(0.5, 0.9))

    n = X.shape[0]
    print(f"training: {args.epochs} epochs, {num_continuous} continuous features")

    for epoch in range(args.epochs):
        perm = torch.randperm(n)
        d_loss_acc = g_loss_acc = 0.0
        steps = 0

        for start in range(0, n - BATCH_SIZE + 1, BATCH_SIZE):
            idx = perm[start : start + BATCH_SIZE]
            real = X[idx]
            cond = cond_embed(A[idx], G[idx], D[idx])
            real_full = torch.cat([real, torch.zeros(len(idx), num_categorical)], dim=1)

            # ── critic ──
            for _ in range(CRITIC_STEPS):
                z = torch.randn(len(idx), LATENT_DIM)
                with torch.no_grad():
                    out = gen(z, cond.detach())
                    fake_full = torch.cat([out["continuous"], out["categorical"]], dim=1)

                d_real = crit(real_full, cond.detach())
                d_fake = crit(fake_full, cond.detach())
                gp = gradient_penalty(
                    crit, real_full, fake_full, cond.detach(), lambda_gp=LAMBDA_GP
                )
                d_loss = d_fake.mean() - d_real.mean() + gp

                opt_d.zero_grad()
                d_loss.backward()
                opt_d.step()

            # ── generator ──
            z = torch.randn(len(idx), LATENT_DIM)
            cond = cond_embed(A[idx], G[idx], D[idx])
            out = gen(z, cond)
            fake_full = torch.cat([out["continuous"], out["categorical"]], dim=1)
            g_loss = -crit(fake_full, cond).mean()

            opt_g.zero_grad()
            g_loss.backward()
            opt_g.step()

            d_loss_acc += float(d_loss.detach())
            g_loss_acc += float(g_loss.detach())
            steps += 1

        if epoch % 50 == 0 or epoch == args.epochs - 1:
            print(f"  epoch {epoch:4d}  d {d_loss_acc/steps:+.4f}  g {g_loss_acc/steps:+.4f}")

    # ── Evaluate: how close are the generated marginals to the real ones? ────
    gen.eval()
    cond_embed.eval()
    with torch.no_grad():
        z = torch.randn(2000, LATENT_DIM)
        ridx = torch.randint(0, n, (2000,))
        cond = cond_embed(A[ridx], G[ridx], D[ridx])
        synth = gen(z, cond)["continuous"].numpy()

    real_mean, real_std = scaled.mean(axis=0), scaled.std(axis=0)
    synth_mean, synth_std = synth.mean(axis=0), synth.std(axis=0)
    mean_err = float(np.abs(real_mean - synth_mean).mean())
    std_err = float(np.abs(real_std - synth_std).mean())
    print(f"marginal fit: mean abs err {mean_err:.4f}, std abs err {std_err:.4f} (scaled units)")

    # ── Export ───────────────────────────────────────────────────────────────
    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    tensors: list[tuple[str, torch.Tensor]] = []
    for name, p in cond_embed.state_dict().items():
        tensors.append((f"cond.{name}", p))
    for name, p in gen.state_dict().items():
        # Skip BatchNorm batch counters — inference uses running stats only.
        if name.endswith("num_batches_tracked"):
            continue
        tensors.append((f"gen.{name}", p))

    blob = bytearray()
    layout = []
    for name, tensor in tensors:
        arr = tensor.detach().cpu().numpy().astype(np.float32).ravel()
        layout.append(
            {"name": name, "shape": list(tensor.shape), "offset": len(blob) // 4, "size": arr.size}
        )
        blob.extend(struct.pack(f"<{arr.size}f", *arr.tolist()))

    (out_dir / "synmedix-generator.bin").write_bytes(bytes(blob))

    # Real-cohort reference stats, in real units, for the UI to plot against.
    real_units = raw
    reference = []
    for i, (col, label, unit) in enumerate(FEATURES):
        reference.append(
            {
                "key": col,
                "label": label,
                "unit": unit,
                "min": float(lo[i]),
                "max": float(hi[i]),
                "mean": float(np.mean(real_units[:, i])),
                "std": float(np.std(real_units[:, i])),
                "p25": float(np.percentile(real_units[:, i], 25)),
                "p75": float(np.percentile(real_units[:, i], 75)),
            }
        )

    manifest = {
        "architecture": "SynMedix conditional WGAN-GP generator",
        "trainedOn": f"{len(feats)}-patient SynMedix sample cohort",
        "imputedCellFraction": missing_rate,
        "fullyCompleteRows": complete_rows,
        "latentDim": LATENT_DIM,
        "hiddenDims": HIDDEN_DIMS,
        "conditionDim": CONDITION_DIM,
        "diagnosisDim": DIAGNOSIS_DIM,
        "numAgeBuckets": NUM_AGE_BUCKETS,
        "numGenders": NUM_GENDERS,
        "numContinuous": num_continuous,
        "numCategorical": num_categorical,
        "epochs": args.epochs,
        "parameterCount": int(sum(t.numel() for _, t in tensors)),
        "marginalFit": {"meanAbsErr": mean_err, "stdAbsErr": std_err},
        "diagnosisCodes": top_codes,
        "features": reference,
        "tensors": layout,
    }
    (out_dir / "synmedix-generator.json").write_text(json.dumps(manifest, indent=1))

    size_kb = len(blob) / 1024
    print(f"exported {len(tensors)} tensors, {manifest['parameterCount']:,} params, {size_kb:.1f} KB")
    print(f"  -> {out_dir/'synmedix-generator.bin'}")
    print(f"  -> {out_dir/'synmedix-generator.json'}")


if __name__ == "__main__":
    main()
