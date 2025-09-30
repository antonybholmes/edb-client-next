/**
 * Capitalizes the first letter of each word in
 * a string. Assumes single dash is a space and double dash
 * is a hyphenated word
 *
 * @param text text to capitalize.
 * @returns the string with each word capitalized.
 */
export function capitalCase(text: string): string {
  return text
    .trim()
    .replaceAll('--', '* ')
    .replaceAll('-', ' ')
    .replaceAll(/_/g, ' ')
    .replaceAll(/ +/g, ' ')
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => word[0]!.toUpperCase() + word.substring(1))
    .join(' ')
    .replaceAll('* ', '-')
}

export function capitalizeFirstWord(text: string): string {
  if (!text || text.length === 0) {
    return text
  }

  return text[0]!.toUpperCase() + text.substring(1).toLowerCase()
}

export function addPeriod(text: string): string {
  if (!text || text.length === 0) {
    return text
  }

  const trimmed = text.trim()

  if (trimmed.endsWith('.') || trimmed.endsWith('!') || trimmed.endsWith('?')) {
    return trimmed
  }

  return `${trimmed}.`
}
