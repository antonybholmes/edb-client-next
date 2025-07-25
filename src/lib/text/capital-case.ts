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
    .filter(word => word.length > 0)
    .map(word => word[0]!.toUpperCase() + word.substring(1))
    .join(' ')
    .replaceAll('* ', '-')
}
