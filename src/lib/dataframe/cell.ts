import { DEFAULT_DATE_FORMAT } from '@/consts'
import { format, parseISO } from 'date-fns'

import {
  DEFAULT_LOCALE,
  formatNumber,
  NA,
  type IFormatNumOpts,
} from '../text/text'
import type { SeriesData } from './series-data'

//export const NA_REGEX = /^(NA|#?N\/A)$/i
//export const NUMBER_REGEX = /^-?\d*\.?\d+([eE][-+]?\d+)?$/ ///^-?\d+\.?\d*$/

/**
 * Given an input value, attempt to type coerce it to a number or
 * date where appropriate.
 *
 * @param v
 * @param keepDefaultNA
 * @returns
 */
export function makeCell(
  v: SeriesData,
  keepDefaultNA: boolean = true
): SeriesData {
  // if empty return empty string
  if (!v) {
    return ''
  }

  // non strings are returned as their original type
  if (typeof v !== 'string') {
    return v
  }

  // convert NA and N/A to nan
  if (keepDefaultNA) {
    if (v === 'NA' || v === 'N/A' || v === '#N/A') {
      return NaN
    }
  }

  //if (NUMBER_REGEX.test(arg)) {

  // see if value is a number
  const n = Number(v)

  if (!Number.isNaN(n)) {
    return n
  }

  // doesn't seem to be number, so see if it's a date

  const d = parseISO(v.toString())

  if (!Number.isNaN(d.getTime())) {
    return d
  }

  // treat it as an actual string
  return v
}

export function makeCells(...args: SeriesData[]): SeriesData[] {
  return args.map(arg => makeCell(arg))
}

interface ICellStrOpts extends IFormatNumOpts {
  defaultValue?: string
}

/**
 * Convert a cell value to a string for display. By default, NaN values are converted to 'NA'
 * but this can be changed by setting defaultValue in the options.
 *
 * @param cell
 * @param options
 * @returns
 */
export function cellStr(cell: SeriesData, options: ICellStrOpts = {}): string {
  const {
    commas = true,
    dp = 4,
    defaultValue = NA,
    locale = DEFAULT_LOCALE,
  } = options

  if (typeof cell === 'number') {
    if (Number.isNaN(cell)) {
      return defaultValue
    } else {
      return formatNumber(cell, { dp, commas, locale })
    }
  } else if (cell instanceof Date) {
    return format(cell, DEFAULT_DATE_FORMAT)
  } else {
    return cell.toString()
  }
}

/**
 * Convert a cell to a numerical value. If the cell does not seem to be
 * numerical, returns NaN
 *
 * @param cell A cell value
 * @returns A number representation of the cell or NaN if the value is not a number.
 */
export function cellNum(cell: SeriesData): number {
  const t = typeof cell

  switch (t) {
    case 'number':
      return cell as number
    case 'boolean':
      return cell ? 1 : 0
    case 'string':
      // empty strings are treated as nan
      if ((cell as string).length > 0) {
        return Number(cell)
      } else {
        return NaN
      }
    default:
      return Number(cell)
  }
}

/**
 * From a zero based col, return the Excel A,B,C...AA etc name
 * equivalent.
 *
 * @param col
 * @returns
 */
export function getExcelColName(col: number) {
  // this works assuming 1 based cols, but since I prefer 0 based
  // indexing for consistency, inc col
  ++col

  const res: number[] = []
  let rem: number

  while (col) {
    --col
    rem = col % 26
    col = Math.floor(col / 26)
    res.push(65 + rem)
  }

  return String.fromCharCode(...res.toReversed())
}
