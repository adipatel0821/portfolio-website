# Blog Syndication

When a blog post is **published** in Contentful, `/api/syndicate` automatically
cross-posts it to LinkedIn, Reddit, and (assisted) Substack. Every post links
back to the canonical article on pateladitya.dev.

## How it works

```
Contentful "Entry.publish" webhook
        │  (?secret=<SYNDICATE_SECRET>)
        ▼
/api/syndicate  ──►  LinkedIn   (official Posts API — link-share to your profile)
                ──►  Reddit     (official API — self-post to u/<you>)
                ──►  Substack   (assisted — draft pushed to Discord, you click publish)
```

- **Idempotent:** only the *first* publish syndicates. Contentful bumps
  `sys.publishedCounter` on every publish, so later edits never re-post.
- **Fails independently:** a broken/missing credential on one platform skips
  only that platform. Nothing else is blocked.
- **Stateless:** LinkedIn/Reddit tokens are minted per-request from long-lived
  refresh credentials, so no database is needed on Vercel.

## 1. Contentful webhook

Settings → Webhooks → Add Webhook:

- **URL:** `https://pateladitya.dev/api/syndicate?secret=<SYNDICATE_SECRET>`
- **Triggers:** `Entry` → `Publish` only
- **Filter (recommended):** content type `equals` `blogPost`
- Leave the default `X-Contentful-Topic` header enabled.

## 2. Environment variables (set in Vercel → Project → Settings → Environment Variables)

```bash
# Gate for the webhook. Falls back to REVALIDATE_SECRET if unset.
SYNDICATE_SECRET=

# Canonical site URL (optional; defaults to https://pateladitya.dev)
NEXT_PUBLIC_SITE_URL=https://pateladitya.dev

# ── Reddit (script app @ https://www.reddit.com/prefs/apps) ──
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
REDDIT_USERNAME=
REDDIT_PASSWORD=
REDDIT_USER_AGENT=web:pateladitya-portfolio-syndication:1.0 (by /u/adipatel0821)

# ── LinkedIn (dev app + "Share on LinkedIn" product, w_member_social) ──
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_REFRESH_TOKEN=
LINKEDIN_AUTHOR_URN=urn:li:person:xxxxxxxx
LINKEDIN_API_VERSION=202506   # optional, bump as LinkedIn versions roll

# ── Substack (assisted via Discord) ──
DISCORD_SYNDICATION_WEBHOOK=
SUBSTACK_PUBLISH_URL=https://<your-pub>.substack.com/publish/post?type=newsletter
```

Any platform whose vars are absent is silently skipped — you can turn them on
one at a time.

## 3. Per-platform setup notes

### Reddit
1. https://www.reddit.com/prefs/apps → **create app** → type **script**.
2. Copy the client id (under the app name) and secret.
3. Posts go to your **own profile** (`u/<username>`) — no subreddit rules apply.
4. Reddit's late-2025 Responsible Builder Policy may require approving the app
   via their ticket form before the token works.

### LinkedIn
1. https://www.linkedin.com/developers → create an app, add the
   **Share on LinkedIn** product (grants `w_member_social`).
2. Run the 3-legged OAuth flow once to get a **refresh token** (365-day).
3. Get your author URN: `GET https://api.linkedin.com/v2/userinfo` → `sub` →
   `LINKEDIN_AUTHOR_URN=urn:li:person:<sub>`.
4. The API publishes a feed **link-share** (not a native long-form "article" —
   that's not available via API).

### Substack (assisted)
No official write API exists, so on publish the formatted post + an editor deep
link are pushed to your Discord webhook. Open Discord, copy, paste into Substack,
publish. To fully automate later, swap `assistSubstack()` for an unofficial
cookie-based client (fragile, ToS gray-area).

## 4. Test it

```bash
curl -X POST "https://pateladitya.dev/api/syndicate?secret=<SYNDICATE_SECRET>" \
  -H "Content-Type: application/json" \
  -H "X-Contentful-Topic: ContentManagement.Entry.publish" \
  -d '{"sys":{"contentType":{"sys":{"id":"blogPost"}},"publishedCounter":1},
       "fields":{"slug":{"en-US":"test-post"},"title":{"en-US":"Test"},
       "excerpt":{"en-US":"Hello"},"tags":{"en-US":["Test"]}}}'
```

The JSON response lists each platform's `posted` / `skipped` / `failed` status.
