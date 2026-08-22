/**
 * Minimal class-name joiner. Deliberately not the `clsx` package, this is
 * eight lines and keeps a dependency out of the bundle.
 */
type ClassValue = string | number | null | undefined | false | ClassValue[]

export function clsx(...inputs: ClassValue[]): string {
  const out: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (Array.isArray(input)) {
      const nested = clsx(...input)
      if (nested) out.push(nested)
    } else {
      out.push(String(input))
    }
  }
  return out.join(' ')
}
