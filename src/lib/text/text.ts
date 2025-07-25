export const NA = 'NA'

export type UndefStr = string | undefined
export type NullStr = string | null
export type UndefNullStr = string | undefined | null

// export function capitalizeSentence(text: string): string {
//   return text
//     .trim()
//     .replaceAll('--', '* ')
//     .replaceAll('-', ' ')
//     .replaceAll(/ +/g, ' ')
//     .split(' ')
//     .filter(word => word.length > 0)
//     .map((word, wi) =>
//       wi === 0 ? word[0]!.toUpperCase() + word.substring(1) : word
//     )
//     .join(' ')
//     .replaceAll('* ', '-')
// }

/**
 * Truncates a string to a max number of chars adding
 * an ellipsis at the end if the string is truncated.
 *
 * @param name  a name to shorten.
 * @param l     max number of chars
 * @returns     a shortened name with an ellipsis at the
 *              end to denote when string was truncated.
 */
export function getShortName(name: string, l: number = 20) {
  if (name.length < l) {
    return name
  }

  return name.substring(0, l) + '...'
}

/**
 * Format certain words to appear consistently in
 * strings. Mostly applies to words like SVG which
 * may be capitalized to Svg.
 *
 * @param name
 * @returns
 */
export function fixName(name: string) {
  return name
    .replaceAll('Svg', 'SVG')
    .replace('Faq', 'FAQ')
    .replaceAll('-', ' ')
}

interface ITruncateOptions {
  length?: number
  omission?: string
  separator?: string
}

/**
 * Truncates a string to a specified length, adding an omission
 * string at the end if the text is truncated.
 * If the length is -1, the text is returned in full.
 * If the text is shorter than the specified length, it is returned as is.
 *
 * @param text The text to truncate.
 * @param options Options for truncation, including:
 * - `length`: The maximum length of the text (default is 16).
 * - `omission`: The string to append if the text is truncated (default is '...').
 * - `separator`: A string to insert before the omission (default is '').
 * @returns The truncated text.
 */
export function truncate(text: string, options: ITruncateOptions = {}) {
  const { length, omission, separator } = {
    length: 16,
    omission: '...',
    separator: '',
    ...options,
  }

  if (text.length < length || length === -1) {
    return text
  }

  return (
    text.slice(0, Math.max(0, length - omission.length - separator.length)) +
    separator +
    omission
  )
}

export function formattedList(values: string[]): string {
  if (values.length === 0) {
    return ''
  }

  if (values.length === 1) {
    return values[0]!
  }

  return (
    values.slice(0, values.length - 1).join(', ') +
    ', and ' +
    values[values.length - 1]
  )
}

/**
 * Returns true if value is an array of strings
 * @param value
 * @returns
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string')
}

export function splitOnCapitalLetters(str: string): string {
  // Use a regular expression to match capital letters and split on them
  return str.split(/(?=[A-Z])/).join(' ')
}

/**
 * Returns a number as a string formatted to a given number of decimal places.
 * If the number is an integer, decimal places are not added.
 * If dp = -1, number is displayed in full.
 *
 * @param x
 * @param dp
 * @returns
 */
export function formatNumber(x: number, dp: number = -1): string {
  if (Number.isInteger(x) || dp === -1) {
    return x.toLocaleString()
  } else {
    return x.toFixed(dp)
  }
}
