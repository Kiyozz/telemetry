/**
 * Papyrus Compiler App already strips the user's name from what it sends. The
 * server applies the same rules again, so that an older or modified client can
 * never store or show anything that identifies a person.
 */
const replacements: [RegExp, string][] = [
  // file:///C:/Users/name/.../chunk.js:1:2301 -> chunk.js:1:2301
  [/file:\/\/[^\s)'"]*\/([^/\s)'"]+)/gi, '$1'],
  // C:\Users\name\...\file.psc or C:/Users/name/.../file.psc -> file.psc
  [/\b[a-z]:[\\/](?:[^\\/\s)'"]+[\\/])*([^\\/\s)'"]*)/gi, '$1'],
  // \\server\share\...\file.psc -> file.psc
  [/\\\\(?:[^\\\s)'"]+\\)+([^\\\s)'"]*)/g, '$1'],
  // /home/name/... or /Users/name/... -> ~/...
  [/\/(?:home|Users)\/[^/\s)'"]+/g, '~'],
  // e-mail addresses
  [/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '<email>'],
  // random identifiers, like RPC request ids, which also split identical errors apart
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, '<id>'],
]

export function anonymizeText(text: string): string {
  let result = text

  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement)
  }

  return result
}

export function anonymize<T>(value: T): T {
  if (typeof value === 'string') {
    return anonymizeText(value) as T
  }

  if (Array.isArray(value)) {
    return value.map(anonymize) as T
  }

  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, anonymize(entry)])) as T
  }

  return value
}

/**
 * Events stored before 2026 hold their properties as a JSON encoded string
 * inside the jsonb column. Newer events hold a plain object.
 */
export function readProperties(value: unknown): Record<string, unknown> {
  let parsed = value

  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value)
    } catch {
      return {}
    }
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {}
  }

  return anonymize(parsed as Record<string, unknown>)
}
