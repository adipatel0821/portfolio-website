import type { SyndicationPost, SyndicationResult } from './types'

// Reddit "script" app (OAuth password grant). Posts a self-post to your own
// user profile (u/username) — no subreddit rules, no self-promo bans.
// Register the app at https://www.reddit.com/prefs/apps (type: "script").

const {
  REDDIT_CLIENT_ID,
  REDDIT_CLIENT_SECRET,
  REDDIT_USERNAME,
  REDDIT_PASSWORD,
} = process.env

// Reddit heavily throttles generic user agents — keep this descriptive.
const USER_AGENT =
  process.env.REDDIT_USER_AGENT ||
  `web:pateladitya-portfolio-syndication:1.0 (by /u/${REDDIT_USERNAME ?? 'unknown'})`

async function getAccessToken(): Promise<string> {
  const basic = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')
  const res = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'password',
      username: REDDIT_USERNAME!,
      password: REDDIT_PASSWORD!,
    }),
  })
  const json = await res.json()
  if (!res.ok || !json.access_token) {
    throw new Error(`token ${res.status}: ${JSON.stringify(json)}`)
  }
  return json.access_token as string
}

export async function postToReddit(post: SyndicationPost): Promise<SyndicationResult> {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET || !REDDIT_USERNAME || !REDDIT_PASSWORD) {
    return { platform: 'reddit', status: 'skipped', detail: 'not configured' }
  }
  try {
    const token = await getAccessToken()
    const selftext = `${post.excerpt}\n\nRead the full post: ${post.url}`
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': USER_AGENT,
      },
      body: new URLSearchParams({
        sr: `u_${REDDIT_USERNAME}`, // profile "subreddit"
        kind: 'self',
        title: post.title,
        text: selftext,
        api_type: 'json',
        resubmit: 'true',
        sendreplies: 'false',
      }),
    })
    const json = await res.json()
    const errors = json?.json?.errors
    if (!res.ok || (Array.isArray(errors) && errors.length > 0)) {
      throw new Error(JSON.stringify(errors?.length ? errors : json))
    }
    return { platform: 'reddit', status: 'posted', url: json?.json?.data?.url }
  } catch (err) {
    return { platform: 'reddit', status: 'failed', detail: (err as Error).message }
  }
}
