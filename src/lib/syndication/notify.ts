// Lightweight Discord webhook notifier — used to deliver the "assisted"
// Substack draft to you for one-click manual publishing.

const { DISCORD_SYNDICATION_WEBHOOK } = process.env

export function hasNotifier(): boolean {
  return Boolean(DISCORD_SYNDICATION_WEBHOOK)
}

export async function notifyDiscord(content: string): Promise<boolean> {
  if (!DISCORD_SYNDICATION_WEBHOOK) return false
  // Discord hard-caps message content at 2000 characters.
  const body = content.length > 1990 ? content.slice(0, 1990) + '…' : content
  const res = await fetch(DISCORD_SYNDICATION_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: body }),
  })
  return res.ok
}
