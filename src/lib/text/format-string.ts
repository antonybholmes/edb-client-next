const CURRENT_YEAR = new Date().getFullYear()

/**
 * Performs some cleanups on strings.
 *
 * Replaces ${CURRENT_YEAR} with the actual current 4 digit year,
 * ${START_YEAR:YYYY} with a range from the given year to current year,
 * and (C) with the copyright symbol.
 *
 * @param text some text to format
 * @returns text withunknown replacements and formats applied
 */
export function formatString(text: string): string {
  const matcher = text.match(/(\$\{START_YEAR:(\d{4})\})/)

  // for copyright years you can write ${START_YEAR:2020}
  // and it will expand to 2020-currentyear (or just 2020 if start year is current year)
  if (matcher) {
    const year = Number(matcher[2])

    if (year < CURRENT_YEAR) {
      text = text.replace(matcher[0], `${year}-${CURRENT_YEAR}`)
    } else {
      text = text.replace(matcher[0], CURRENT_YEAR.toString())
    }
  }

  // add current year to string
  text = text.replaceAll('${CURRENT_YEAR}', CURRENT_YEAR.toString())

  // replace (C) with copyright symbol
  text = text.replace(/\((?:C|c)\)/g, '©')

  return text
}

/**
 * Formats a number as a percentage string with the given number of decimal places.
 *
 * @param value
 * @param decimals
 * @returns
 */
export function formatAsPercent(value: number, decimals = 0): string {
  return `${(value * 100).toFixed(decimals)}%`
}
