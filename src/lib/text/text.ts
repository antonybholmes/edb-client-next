export const NA = 'NA'

export type UndefStr = string | undefined
export type NullStr = string | null
export type UndefNullStr = string | undefined | null

export function capitalizeSentence(text: string): string {
  return text
    .trim()
    .replaceAll('--', '* ')
    .replaceAll('-', ' ')
    .replaceAll(/ +/g, ' ')
    .split(' ')
    .filter(word => word.length > 0)
    .map((word, wi) =>
      wi === 0 ? word[0]!.toUpperCase() + word.substring(1) : word
    )
    .join(' ')
    .replaceAll('* ', '-')
}

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
