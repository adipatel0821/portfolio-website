/**
 * One-time migration script: pushes the 6 hardcoded posts into Contentful.
 *
 * Requirements:
 *   Node 18+  (uses native fetch)
 *
 * Usage:
 *   CONTENTFUL_MANAGEMENT_TOKEN=<your-token> \
 *   CONTENTFUL_SPACE_ID=yo9u2p2m3ho9 \
 *   node scripts/migrate-to-contentful.mjs
 *
 * Get your Management Token at:
 *   contentful.com → Settings → API Keys → Content Management Tokens → Generate
 */

const SPACE_ID = process.env.CONTENTFUL_SPACE_ID
const CMA_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN

if (!SPACE_ID || !CMA_TOKEN) {
  console.error('ERROR: Set CONTENTFUL_SPACE_ID and CONTENTFUL_MANAGEMENT_TOKEN env vars.')
  process.exit(1)
}

const BASE = `https://api.contentful.com/spaces/${SPACE_ID}/environments/master`
const HEADERS = {
  Authorization: `Bearer ${CMA_TOKEN}`,
  'Content-Type': 'application/vnd.contentful.management.v1+json',
}

// ─── CMA helpers ──────────────────────────────────────────────────────────────

async function cma(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: HEADERS,
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!res.ok) {
    const msg = json?.message ?? JSON.stringify(json)
    throw new Error(`CMA ${method} ${path} → ${res.status}: ${msg}`)
  }
  return json
}

// ─── Content type ─────────────────────────────────────────────────────────────

async function ensureContentType() {
  console.log('Setting up blogPost content type…')

  const ct = {
    name: 'Blog Post',
    displayField: 'title',
    fields: [
      { id: 'title',         name: 'Title',          type: 'Symbol',   required: true  },
      { id: 'slug',          name: 'Slug',           type: 'Symbol',   required: true,
        validations: [{ unique: true }] },
      { id: 'publishedDate', name: 'Published Date', type: 'Date',     required: true  },
      { id: 'excerpt',       name: 'Excerpt',        type: 'Text',     required: true  },
      { id: 'body',          name: 'Body',           type: 'RichText', required: true  },
      { id: 'coverImage',    name: 'Cover Image',    type: 'Link',     required: false,
        linkType: 'Asset' },
      { id: 'tags',          name: 'Tags',           type: 'Array',    required: false,
        items: { type: 'Symbol', validations: [] } },
    ],
  }

  let existing
  try {
    existing = await cma('GET', '/content_types/blogPost')
    console.log('  Content type already exists (version', existing.sys.version, ')')
  } catch {
    existing = null
  }

  const saved = existing
    ? await cma('PUT', '/content_types/blogPost', ct)   // update
    : await cma('POST', '/content_types', { ...ct, sys: { id: 'blogPost' } })  // create

  // Activate (publish) the content type
  await fetch(`${BASE}/content_types/blogPost/published`, {
    method: 'PUT',
    headers: { ...HEADERS, 'X-Contentful-Version': String(saved.sys.version) },
  })
  console.log('  blogPost content type activated.')
}

// ─── HTML → Contentful Rich Text ──────────────────────────────────────────────

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

function textNode(value, marks = []) {
  return {
    nodeType: 'text',
    value: decodeEntities(value),
    marks: marks.map((m) => ({ type: m })),
    data: {},
  }
}

function paragraphNode(inlines) {
  return {
    nodeType: 'paragraph',
    data: {},
    content: inlines.length > 0 ? inlines : [textNode('')],
  }
}

function headingNode(level, inlines) {
  return {
    nodeType: `heading-${level}`,
    data: {},
    content: inlines.length > 0 ? inlines : [textNode('')],
  }
}

function listNode(nodeType, items) {
  return { nodeType, data: {}, content: items }
}

function listItemNode(paragraphs) {
  return { nodeType: 'list-item', data: {}, content: paragraphs }
}

/** Parse inline HTML into an array of Contentful text nodes. */
function parseInline(html) {
  const nodes = []
  // Split on strong, em, code inline tags (handles one level of nesting)
  const parts = html.split(/(<strong>[\s\S]*?<\/strong>|<em>[\s\S]*?<\/em>|<code>[\s\S]*?<\/code>)/)

  for (const part of parts) {
    if (!part) continue

    if (part.startsWith('<strong>')) {
      const inner = part.replace(/^<strong>([\s\S]*?)<\/strong>$/, '$1')
      // strong may contain inline code
      const subParts = inner.split(/(<code>[\s\S]*?<\/code>)/)
      for (const sp of subParts) {
        if (!sp) continue
        if (sp.startsWith('<code>')) {
          const t = sp.replace(/^<code>([\s\S]*?)<\/code>$/, '$1').replace(/<[^>]+>/g, '')
          if (t) nodes.push(textNode(t, ['bold', 'code']))
        } else {
          const t = sp.replace(/<[^>]+>/g, '')
          if (t) nodes.push(textNode(t, ['bold']))
        }
      }
    } else if (part.startsWith('<em>')) {
      const t = part.replace(/^<em>([\s\S]*?)<\/em>$/, '$1').replace(/<[^>]+>/g, '')
      if (t) nodes.push(textNode(t, ['italic']))
    } else if (part.startsWith('<code>')) {
      const t = part.replace(/^<code>([\s\S]*?)<\/code>$/, '$1')
      if (t) nodes.push(textNode(t, ['code']))
    } else {
      const t = part.replace(/<[^>]+>/g, '')
      if (t) nodes.push(textNode(t, []))
    }
  }

  return nodes.length > 0 ? nodes : [textNode('')]
}

/** Parse <li> items from a list block's inner HTML. */
function parseListItems(html) {
  const items = []
  const re = /<li>([\s\S]*?)<\/li>/g
  let m
  while ((m = re.exec(html)) !== null) {
    const content = m[1].trim()
    items.push(listItemNode([paragraphNode(parseInline(content))]))
  }
  return items
}

/** Convert an HTML string to a Contentful Rich Text document node. */
function htmlToRichText(html) {
  const nodes = []
  const blockRe = /<(h2|h3|p|ul|ol|pre)>([\s\S]*?)<\/\1>/g
  let m

  while ((m = blockRe.exec(html)) !== null) {
    const [, tag, content] = m

    switch (tag) {
      case 'h2':
        nodes.push(headingNode(2, parseInline(content.trim())))
        break
      case 'h3':
        nodes.push(headingNode(3, parseInline(content.trim())))
        break
      case 'p':
        nodes.push(paragraphNode(parseInline(content.trim())))
        break
      case 'ul':
        nodes.push(listNode('unordered-list', parseListItems(content)))
        break
      case 'ol':
        nodes.push(listNode('ordered-list', parseListItems(content)))
        break
      case 'pre': {
        // Contentful has no code-block node — store as paragraph with code marks
        const codeMatch = content.match(/<code>([\s\S]*?)<\/code>/)
        const codeText = (codeMatch ? codeMatch[1] : content).replace(/<[^>]+>/g, '')
        nodes.push(paragraphNode([textNode(codeText, ['code'])]))
        break
      }
    }
  }

  return {
    nodeType: 'document',
    data: {},
    content: nodes.length > 0 ? nodes : [paragraphNode([textNode('')])],
  }
}

// ─── Date helper ──────────────────────────────────────────────────────────────

const MONTH = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
}

function toIsoDate(label) {
  // 'Feb 2025' → '2025-02-01'
  const [mon, yr] = label.split(' ')
  return `${yr}-${MONTH[mon] ?? '01'}-01`
}

// ─── Post data (from src/data/posts.ts) ───────────────────────────────────────

const POSTS = [
  {
    slug: 'multimodal-gan-synthetic-patient-data',
    title: 'How I Built a Multimodal GAN to Generate Synthetic Patient Records',
    excerpt: 'Walking through the architecture, training challenges, and deployment of a GAN that synthesizes text, imaging descriptors, and vitals — achieving ~40% training data diversity improvement.',
    tags: ['Machine Learning'],
    date: 'Feb 2025',
    content: `
<h2>The Problem: Healthcare AI is Data-Starved</h2>
<p>Building machine learning models for healthcare is uniquely difficult. You need large, diverse datasets — but real patient data is locked behind HIPAA, IRBs, and legitimate privacy concerns. The result is that most healthcare ML research is either bottlenecked on data access or trained on dangerously small samples that don't generalize.</p>
<p>My project tackled this head-on: build a Generative Adversarial Network capable of producing <strong>realistic, multimodal patient records</strong> — combining clinical text notes, medical imaging descriptors, and time-series vitals — without using a single real patient's data in the output.</p>

<h2>Architecture: Why Multimodal is Hard</h2>
<p>Most GAN research focuses on a single modality: images, text, or tabular data. Multimodal generation is fundamentally harder because you need the generator to maintain <strong>internal consistency</strong> across modalities. A generated patient record where the chest X-ray descriptor says "clear bilateral fields" but the vitals show SpO₂ of 82% is worse than useless — it's misleading.</p>
<p>I structured the architecture around a shared latent space. The generator has three parallel heads (text, imaging, vitals) that all decode from a single noise vector z ∈ ℝ128. The discriminator evaluates records holistically — it sees all three modalities together and must decide if the combination is realistic.</p>
<p>I also integrated <strong>PaLM-E</strong> for the text modality reasoning — using it to validate that generated clinical notes were semantically coherent with the numerical vitals data. This acted as an additional adversarial signal during training.</p>

<h2>Training Challenges</h2>
<p>GANs are notoriously unstable, and multimodal GANs doubly so. The three main issues I hit:</p>
<ul>
  <li><strong>Mode collapse</strong> — the generator converging to producing nearly identical records. Fixed with minibatch discrimination and spectral normalization on the discriminator.</li>
  <li><strong>Cross-modal inconsistency</strong> — the text and vitals heads learning independently. Fixed by adding a cross-modal consistency loss term that penalizes semantic contradictions between modalities.</li>
  <li><strong>Training instability</strong> — solved by switching from vanilla GAN loss to Wasserstein loss with gradient penalty (WGAN-GP).</li>
</ul>
<p>After these fixes, Fréchet Inception Distance (FID) dropped significantly and the generated records passed a manual review by a domain expert.</p>

<h2>Results</h2>
<p>The final model achieved approximately <strong>40% improvement in training data diversity</strong> when the synthetic records were added to a downstream classification task. More importantly, the synthetic data did not introduce any privacy risks — it's entirely generated from learned distributions, not memorized records.</p>
<p>The pipeline is deployed on <strong>GCP Vertex AI</strong> for scalable inference, allowing researchers to request batches of synthetic patient cohorts on demand.</p>

<h2>Key Takeaways</h2>
<ul>
  <li>Multimodal consistency requires explicit architectural enforcement, not just hoping the model figures it out.</li>
  <li>WGAN-GP is almost always the right choice for complex generative tasks.</li>
  <li>Domain expert validation is non-negotiable in healthcare AI — FID scores alone are insufficient.</li>
</ul>
    `.trim(),
  },
  {
    slug: 'parallel-ehr-processing-3x-throughput',
    title: 'Distributed EHR Processing: Achieving 3x Throughput with Python and SQL',
    excerpt: 'How I redesigned a serial EHR ingestion pipeline into a distributed system that processes 10 GB of Electronic Health Records 3x faster — and what I learned about bottlenecks along the way.',
    tags: ['Data Engineering'],
    date: 'Jan 2025',
    content: `
<h2>Starting Point: A Serial Pipeline That Couldn't Scale</h2>
<p>The original pipeline was simple: read EHR files, parse them, validate, transform, and load into the target database. It worked fine for small batches but collapsed under the full dataset — approximately <strong>10 GB of structured and semi-structured EHR records</strong> across multiple formats (HL7, FHIR JSON, CSV exports).</p>
<p>The serial architecture meant a single worker processed records one file at a time. On a modern machine with 8 cores sitting idle, this was an obvious waste. But "just add multiprocessing" is rarely as simple as it sounds with stateful pipelines.</p>

<h2>Profiling First, Optimizing Second</h2>
<p>Before writing a single line of parallel code, I profiled the existing pipeline with <code>cProfile</code> and <code>line_profiler</code>. The bottlenecks were clear:</p>
<ul>
  <li>60% of time spent in XML/JSON parsing (HL7 and FHIR formats)</li>
  <li>25% in database write operations (sequential commits per record)</li>
  <li>15% in validation logic</li>
</ul>
<p>This told me the approach: parallelize parsing with <code>multiprocessing</code>, batch database writes, and leave validation (which had shared state) for a separate sequential pass.</p>

<h2>The Architecture</h2>
<p>I split the pipeline into three stages:</p>
<ol>
  <li><strong>Parallel Parse Workers</strong> — a pool of 6 workers, each responsible for a shard of input files. Workers serialize parsed records to a shared queue.</li>
  <li><strong>Validation Stage</strong> — single-threaded but optimized with vectorized Pandas operations. Processes records from the queue in micro-batches.</li>
  <li><strong>Batch Writer</strong> — accumulates records into batches of 500 and commits with a single SQL transaction. This alone cut write time by 70%.</li>
</ol>
<p>The queue between stages acts as a backpressure mechanism — if validation falls behind, parse workers slow down naturally.</p>

<h2>Results</h2>
<p>The redesigned pipeline processed the full 10 GB dataset in roughly one-third the original time — a <strong>3x throughput improvement</strong>. More importantly, it's horizontally scalable: adding more parse workers continues to improve throughput until the database write stage becomes the bottleneck.</p>

<h2>Lessons Learned</h2>
<ul>
  <li>Always profile before optimizing. The bottleneck is rarely where you think it is.</li>
  <li>Batch database writes are one of the highest-ROI optimizations in data pipelines.</li>
  <li>Design for backpressure from the start — queue-based architecture makes it natural.</li>
</ul>
    `.trim(),
  },
  {
    slug: 'apache-airflow-etl-production',
    title: 'Apache Airflow in Production: Building the AMFI ETL Pipeline',
    excerpt: 'A practical walkthrough of designing, building, and deploying an Apache Airflow DAG to automate AMFI mutual fund regulatory data ingestion — including the mistakes that cost me two days.',
    tags: ['Data Engineering'],
    date: 'Mar 2025',
    content: `
<h2>The Problem: Manual Regulatory Data = Fragile Reporting</h2>
<p>AMFI (Association of Mutual Funds in India) publishes daily NAV data, fund schemes, and regulatory reports. The team I worked with at Intellect Design Arena was manually downloading and processing this data — a process that took hours, introduced human error, and broke whenever AMFI changed their file format.</p>
<p>My task: automate the entire ingestion, transformation, and reporting workflow using Apache Airflow.</p>

<h2>DAG Design</h2>
<p>The DAG has five task groups, each handling a distinct responsibility:</p>
<ol>
  <li><strong>Extract</strong> — HTTP sensor that polls AMFI endpoints, downloads files to a staging area. Uses Airflow's <code>HttpSensor</code> to wait for daily data availability before proceeding.</li>
  <li><strong>Validate</strong> — Python operator that checks file checksums, row counts, and schema conformity against expected structure. Raises <code>AirflowException</code> on failure, triggering alerts.</li>
  <li><strong>Transform</strong> — Pandas-heavy transformation: normalizes fund categories, fills missing NAVs with forward-fill, computes rolling metrics, and enriches with scheme master data.</li>
  <li><strong>Load</strong> — Bulk inserts into PostgreSQL using <code>COPY FROM</code> (significantly faster than row-by-row inserts). Idempotent upsert logic prevents duplicate records on reruns.</li>
  <li><strong>Report</strong> — Triggers Power BI dataset refresh via REST API, making updated dashboards available to stakeholders automatically.</li>
</ol>

<h2>The Mistake That Cost Two Days</h2>
<p>I initially designed the Transform task to load the entire day's file into memory at once. This worked fine in development (small sample files) but failed silently in production when AMFI published a full year-end dataset 20x the usual size. The task appeared to succeed but produced truncated output.</p>
<p>The fix was chunked processing with <code>pd.read_csv(chunksize=10000)</code> and streaming inserts. Lesson: always test with production-scale data before declaring anything "done."</p>

<h2>Data Quality Gates</h2>
<p>I added a dedicated quality-check task that runs after Load and before Report. It validates:</p>
<ul>
  <li>Row count within expected range for the day of week</li>
  <li>No NAV values more than 15% different from previous day (catches data errors, not market moves)</li>
  <li>All active fund schemes present in the loaded batch</li>
</ul>
<p>If any check fails, the DAG sends a Slack alert and skips the Power BI refresh — stakeholders see yesterday's data rather than bad data.</p>

<h2>Outcome</h2>
<p>The pipeline runs daily at 6:00 AM, processes AMFI data automatically, and has run reliably since deployment. Manual data preparation time dropped to near zero.</p>
    `.trim(),
  },
  {
    slug: 'iot-smart-home-energy-raspberry-pi',
    title: 'Building SHEMS: A Smart Home Energy Monitor with Raspberry Pi and Arduino',
    excerpt: 'How I built a real-time home energy management system using embedded hardware, Python, and a web dashboard — and why IoT projects are the best way to learn full-stack engineering.',
    tags: ['IoT'],
    date: 'Aug 2023',
    content: `
<h2>Why Build a Home Energy Monitor?</h2>
<p>Energy waste in homes is invisible. Devices run 24/7 because nobody notices — until the electricity bill arrives. SHEMS (Smart Home Energy Management System) was built to make energy consumption <strong>visible and actionable in real time</strong>, not a month later.</p>

<h2>Hardware Stack</h2>
<p>The system has two hardware layers:</p>
<ul>
  <li><strong>Arduino Uno</strong> with ACS712 current sensors — one per circuit breaker slot. The Arduino reads analog current values at 100 Hz, converts to watts using the known mains voltage, and sends averaged readings over serial every 5 seconds.</li>
  <li><strong>Raspberry Pi 4</strong> as the central hub — reads the Arduino serial stream, aggregates data, runs the Python backend, and hosts the web dashboard over the local network.</li>
</ul>
<p>The Arduino/Pi split is intentional: the Arduino handles hard real-time sampling (consistent 100 Hz is difficult in Python), while the Pi handles the network and storage layer where Python is perfectly adequate.</p>

<h2>Software Architecture</h2>
<p>The Pi runs three processes:</p>
<ol>
  <li><strong>Serial Reader</strong> — a Python daemon that reads the Arduino serial port, parses power readings, and writes them to a SQLite database with timestamps.</li>
  <li><strong>FastAPI Backend</strong> — serves historical and real-time data via REST API. WebSocket endpoint pushes live readings to the dashboard every 5 seconds.</li>
  <li><strong>Next.js Dashboard</strong> — real-time charts (Recharts), device-level consumption breakdown, 7-day history, and configurable alert thresholds.</li>
</ol>

<h2>Anomaly Detection</h2>
<p>The most interesting piece: I added a simple anomaly detector using Z-score over a rolling 24-hour window. If a circuit's consumption is more than 2.5 standard deviations above its recent average, the system sends a push notification. This catches "left the oven on" scenarios reliably without constant false positives.</p>

<h2>What I Learned</h2>
<ul>
  <li>Embedded and backend engineering require very different mental models — and combining them in one project accelerates both.</li>
  <li>Hardware failure modes are unpredictable. Adding retry logic and watchdog timers to the serial reader saved the project during a demo.</li>
  <li>Real-time visualization changes how people think about data — stakeholders instantly understood consumption patterns when they could see them move live.</li>
</ul>
    `.trim(),
  },
  {
    slug: 'btech-to-ms-india-to-hoboken',
    title: 'From VIT Chennai to Stevens Institute: What I Learned Moving for a Graduate CS Degree',
    excerpt: 'The academic, cultural, and professional differences I encountered moving from a B.Tech in India to an M.S. CS program in the US — and what I wish I had known before applying.',
    tags: ['Personal'],
    date: 'Jun 2025',
    content: `
<h2>Why Stevens?</h2>
<p>When I finished my B.Tech at VIT Chennai in May 2025, I had completed three internships, shipped real production code, and built projects deployed on AWS and GCP. I knew I wanted to go deeper on ML research and systems — and I wanted to do it in the US, close to New York City's tech ecosystem.</p>
<p>Stevens Institute of Technology in Hoboken, NJ was the right fit: rigorous CS program, strong connections to the NYC industry, and a Hoboken location that puts you 10 minutes from Manhattan by PATH train.</p>

<h2>The Academic Difference</h2>
<p>Indian B.Tech programs (at least at VIT) are exam-heavy and theory-first. You learn a lot of computer science fundamentals thoroughly. US graduate programs, in my experience so far, are <strong>project-heavy and research-oriented</strong>. The expectation is that you already have the fundamentals — now you apply and extend them.</p>
<p>This means the transition is smoother if you've actually built things. Pure exam-focused preparation would have left me struggling. My internship and project work turned out to be my most valuable preparation.</p>

<h2>What I Wish I'd Known</h2>
<ul>
  <li><strong>Start building a portfolio early.</strong> Research labs and internship interviewers want to see code. A GitHub with real projects matters more than GPA for most industry roles.</li>
  <li><strong>Network aggressively before arriving.</strong> LinkedIn, Handshake, and alumni networks are the primary channels for US internship recruiting. Start 6 months before you want to start working.</li>
  <li><strong>Hoboken is not NYC, but it's close enough.</strong> The PATH train is incredibly convenient. Cost of living is lower than Manhattan but the city is accessible whenever you need it.</li>
  <li><strong>Choose projects over coursework breadth.</strong> A deep project in your core interest area teaches more and signals more than a wide but shallow course list.</li>
</ul>

<h2>What's Next</h2>
<p>I'm currently in my first semester at Stevens, focused on ML systems and distributed computing coursework. Outside of class, I'm continuing to work on the SynMedix AI platform and looking for ML engineering internships for summer 2026.</p>
    `.trim(),
  },
  {
    slug: 'gcp-vertex-ai-deployment-guide',
    title: "Deploying ML Models on GCP Vertex AI: A Practical First-Timer's Guide",
    excerpt: 'Everything I learned deploying a multimodal GAN to GCP Vertex AI — from containerizing the model to setting up endpoints, monitoring, and keeping costs sane.',
    tags: ['Cloud / MLOps'],
    date: 'Apr 2025',
    content: `
<h2>Why Vertex AI?</h2>
<p>When it came time to deploy my multimodal GAN for synthetic patient data generation, I evaluated AWS SageMaker and GCP Vertex AI. I chose Vertex AI for this project because of its tighter integration with the rest of the GCP ecosystem (Cloud Storage, BigQuery, Artifact Registry) and because the Vertex AI Workbench made iterative development easier.</p>

<h2>Step 1: Containerize Your Model</h2>
<p>Vertex AI serves models as containers. You need a Docker image that installs your dependencies, exposes an HTTP server on port 8080, and handles <code>/health</code> and <code>/predict</code> routes.</p>
<p>I used FastAPI for the server — it's lightweight and async, which matters when your model inference takes a few seconds per request. The Dockerfile looks roughly like:</p>
<pre><code>FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]</code></pre>
<p>Push this to Google Artifact Registry (not Docker Hub — Vertex AI works better with Artifact Registry for auth).</p>

<h2>Step 2: Register the Model</h2>
<p>Once your container is in Artifact Registry, register it as a Vertex AI Model resource. The key parameters are the container image URI, the prediction route (<code>/predict</code>), and the health route (<code>/health</code>). You can do this via the Console or the Python SDK — I prefer the SDK for reproducibility.</p>

<h2>Step 3: Create an Endpoint and Deploy</h2>
<p>Creating an endpoint is separate from deploying a model to it — this lets you do blue/green deployments and traffic splitting later. For my GAN, I deployed to a single <code>n1-standard-4</code> machine with a minimum of 1 replica. The model weights are loaded at container startup from Cloud Storage.</p>

<h2>Keeping Costs Sane</h2>
<p>Vertex AI endpoints charge per compute-hour, not per request. If you leave an endpoint running 24/7 with no traffic, you still pay. For a research project, I set up a Cloud Scheduler job to scale the endpoint to 0 replicas at night and back up in the morning. This cut costs by ~65%.</p>

<h2>Monitoring</h2>
<p>Vertex AI automatically logs prediction requests and latency to Cloud Monitoring. I added custom metrics for model-specific things: generation time per modality, cross-modal consistency score, and output diversity.</p>

<h2>The Full Picture</h2>
<p>Vertex AI is a genuinely good platform once you get past the initial setup friction. The biggest time sinks were: IAM permissions (always), container debugging (test locally with Docker first), and understanding the difference between Model, Endpoint, and DeployedModel resources.</p>
<p>If you're deploying a PyTorch model for the first time, budget a full day for the first deployment. After that, it's fast.</p>
    `.trim(),
  },
]

// ─── Entry creation ───────────────────────────────────────────────────────────

async function createEntry(post) {
  console.log(`  Creating: ${post.title}`)

  const fields = {
    title:         { 'en-US': post.title },
    slug:          { 'en-US': post.slug },
    publishedDate: { 'en-US': toIsoDate(post.date) },
    excerpt:       { 'en-US': post.excerpt },
    body:          { 'en-US': htmlToRichText(post.content) },
    tags:          { 'en-US': post.tags },
  }

  const entry = await cma('POST', '/entries', { fields })
  return entry
}

async function publishEntry(entryId, version) {
  const res = await fetch(`${BASE}/entries/${entryId}/published`, {
    method: 'PUT',
    headers: { ...HEADERS, 'X-Contentful-Version': String(version) },
  })
  if (!res.ok) {
    const json = await res.json()
    throw new Error(`Publish ${entryId} → ${res.status}: ${json?.message ?? ''}`)
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await ensureContentType()

  console.log(`\nMigrating ${POSTS.length} posts…`)

  for (const post of POSTS) {
    try {
      const entry = await createEntry(post)
      await publishEntry(entry.sys.id, entry.sys.version)
      console.log(`  ✓ Published: ${post.slug}`)
    } catch (err) {
      console.error(`  ✗ Failed: ${post.slug} — ${err.message}`)
    }
  }

  console.log('\nDone. Open contentful.com → Content to verify.')
}

main().catch((err) => {
  console.error('Fatal:', err.message)
  process.exit(1)
})
