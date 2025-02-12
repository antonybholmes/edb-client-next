const CURRENT_YEAR = new Date().getFullYear()

/**
 * Performs some cleanups on strings.
 *
 * Replaces ${CURRENT_YEAR} with the actual current 4 digit year.
 *
 * @param text some text to format
 * @returns text withunknown replacements and formats applied
 */
export function formatString(text: string): string {
  const matcher = text.match(/(\$\{START_YEAR:(\d{4})\})/)

  if (matcher) {
    const year = Number(matcher[2])

    if (year < CURRENT_YEAR) {
      text = text.replace(matcher[0], `${year}-${CURRENT_YEAR}`)
    } else {
      text = text.replace(matcher[0], CURRENT_YEAR.toString())
    }
  }

  text = text.replaceAll('${CURRENT_YEAR}', CURRENT_YEAR.toString())
  text = text.replaceAll('(C)', '©')

  return text
}
