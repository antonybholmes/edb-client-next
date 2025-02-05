interface IToLineOpts {
  removeEmptyLines?: boolean
  trim?: boolean
  rtrim?: boolean
}

/**
 * Converts a string (for example a whole txt file read in as a string)
 * to lines by searching for new lines (windows/mac/linux style). Also has
 * options to trim lines and remove empty lines as desired.
 *
 * @param text
 * @param opts
 * @returns
 */
export function textToLines(text: string, opts: IToLineOpts = {}): string[] {
  const { removeEmptyLines, trim, rtrim } = {
    removeEmptyLines: true,
    trim: false,
    rtrim: false,
    ...opts,
  }

  let ret = text.split(/[\r\n]+/g)

  if (trim) {
    ret = ret.map(line => line.trim())
  }

  if (rtrim) {
    ret = ret.map(line => line.trimEnd())
  }

  if (removeEmptyLines) {
    ret = ret.filter((line: string) => line.length > 0)
  }

  return ret
}

interface ITextToTokensOpts {
  sep?: string
}

export function textToTokens(
  text: string,
  opts: ITextToTokensOpts = {}
): string[][] {
  const { sep } = {
    sep: '\t',
    ...opts,
  }

  return textToLines(text, { rtrim: true }).map(line =>
    line.replaceAll('"', '').split(sep)
  )
}
