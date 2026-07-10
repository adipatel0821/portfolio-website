import type { SyndicationPost, SyndicationResult } from './types'

// LinkedIn Posts API (Community Management). Publishes a link-share to your
// personal profile. Requires a LinkedIn developer app with the "Share on
// LinkedIn" product (w_member_social scope) and a stored refresh token.
//
// Access tokens live 60 days; refresh tokens live 365 days and are exchanged
// for a fresh access token on every publish — so this stays stateless on Vercel.

const {
  LINKEDIN_CLIENT_ID,
  LINKEDIN_CLIENT_SECRET,
  LINKEDIN_REFRESH_TOKEN,
  LINKEDIN_AUTHOR_URN, // e.g. urn:li:person:xxxxxxxx
} = process.env

const API_VERSION = process.env.LINKEDIN_API_VERSION || '202506'

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: LINKEDIN_REFRESH_TOKEN!,
      client_id: LINKEDIN_CLIENT_ID!,
      client_secret: LINKEDIN_CLIENT_SECRET!,
    }),
  })
  const json = await res.json()
  if (!res.ok || !json.access_token) {
    throw new Error(`token ${res.status}: ${JSON.stringify(json)}`)
  }
  return json.access_token as string
}

export async function postToLinkedIn(
  post: SyndicationPost,
  commentary: string,
): Promise<SyndicationResult> {
  if (
    !LINKEDIN_CLIENT_ID ||
    !LINKEDIN_CLIENT_SECRET ||
    !LINKEDIN_REFRESH_TOKEN ||
    !LINKEDIN_AUTHOR_URN
  ) {
    return { platform: 'linkedin', status: 'skipped', detail: 'not configured' }
  }
  try {
    const token = await getAccessToken()
    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': API_VERSION,
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        author: LINKEDIN_AUTHOR_URN,
        commentary, // LinkedIn auto-unfurls the canonical URL into a link preview
        visibility: 'PUBLIC',
        distribution: {
          feedDistribution: 'MAIN_FEED',
          targetEntities: [],
          thirdPartyDistributionChannels: [],
        },
        lifecycleState: 'PUBLISHED',
        isReshareDisabledByAuthor: false,
      }),
    })
    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`${res.status}: ${await res.text()}`)
    }
    const id = res.headers.get('x-restli-id') || undefined
    return {
      platform: 'linkedin',
      status: 'posted',
      url: id ? `https://www.linkedin.com/feed/update/${id}` : undefined,
    }
  } catch (err) {
    return { platform: 'linkedin', status: 'failed', detail: (err as Error).message }
  }
}
