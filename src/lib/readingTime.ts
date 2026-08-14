/**
 * Reading time from a Contentful Rich Text document.
 *
 * Walks the node tree collecting text values rather than rendering to HTML and
 * stripping tags — the tree is already structured, and regex-stripping HTML is
 * how you end up counting attribute values as prose.
 */

interface RichTextNode {
  nodeType?: string
  value?: string
  content?: RichTextNode[]
}

/** Average adult reading speed for technical prose, rounded down deliberately. */
const WORDS_PER_MINUTE = 200

export function extractPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return ''
  const n = node as RichTextNode

  if (typeof n.value === 'string') return n.value
  if (Array.isArray(n.content)) {
    return n.content.map(extractPlainText).join(' ')
  }
  return ''
}

export function wordCount(document: unknown): number {
  const text = extractPlainText(document).trim()
  if (!text) return 0
  return text.split(/\s+/).length
}

/** Minutes, floored at 1 — "0 min read" helps nobody. */
export function readingMinutes(document: unknown): number {
  const words = wordCount(document)
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE))
}
