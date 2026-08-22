import type { SyndicationPost, SyndicationResult } from './types'
import { hasNotifier, notifyDiscord } from './notify'

// Substack has NO official write API, so this runs in "assisted" mode: on
// publish it formats a ready-to-paste draft and pushes it to your Discord
// webhook with a deep link to the Substack editor. You paste + publish (~5s).

// e.g. https://<your-publication>.substack.com/publish/post?type=newsletter
const SUBSTACK_PUBLISH_URL = process.env.SUBSTACK_PUBLISH_URL

export function buildSubstackDraft(post: SyndicationPost): string {
  const lines: (string | null)[] = [
    '📝 **New post, ready to cross-post to Substack**',
    '',
    `**Title:** ${post.title}`,
    '',
    '**Subtitle / opener:**',
    post.excerpt,
    '',
    `**Canonical link:** ${post.url}`,
    post.tags.length ? `**Tags:** ${post.tags.join(', ')}` : null,
    '',
    SUBSTACK_PUBLISH_URL ? `▶️ Open the Substack editor: ${SUBSTACK_PUBLISH_URL}` : null,
    '',
    'Paste into a new Substack post and hit publish.',
  ]
  return lines.filter((l) => l !== null).join('\n')
}

export async function assistSubstack(post: SyndicationPost): Promise<SyndicationResult> {
  if (!hasNotifier()) {
    return {
      platform: 'substack',
      status: 'skipped',
      detail: 'DISCORD_SYNDICATION_WEBHOOK not set, no notification channel',
    }
  }
  const sent = await notifyDiscord(buildSubstackDraft(post))
  return sent
    ? { platform: 'substack', status: 'posted', detail: 'draft sent to Discord for manual publish' }
    : { platform: 'substack', status: 'failed', detail: 'Discord webhook rejected the message' }
}
