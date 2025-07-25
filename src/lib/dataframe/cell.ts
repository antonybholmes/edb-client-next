import { DEFAULT_DATE_FORMAT } from '@/consts'
import { format, parseISO } from 'date-fns'
import { formatNumber } from '../text/text'
import type { SeriesData } from './dataframe-types'

export const NA_REGEX = /^(NA|#?N\/A)$/i
export const NUMBER_REGEX = /^-?\d*\.?\d+([eE][-+]?\d+)?$/ ///^-?\d+\.?\d*$/

/**
 * Given an input value, attempt to type coerce it to a number or
 * date where appropriate.
 *
 * @param arg
 * @param keepDefaultNA
 * @returns
 */
export function makeCell(
  arg: SeriesData,
  keepDefaultNA: boolean = true
): SeriesData {
  // non strings are returned as their original type
  if (typeof arg !== 'string') {
    return arg
  }

  // convert NA and N/A to nan
  if (keepDefaultNA) {
    if (!arg || NA_REGEX.test(arg)) {
      return NaN
    }
  }

  // if empty return empty string
  if (!arg) {
    return ''
  }

  //if (NUMBER_REGEX.test(arg)) {

  // see if value is a number
  const v = Number(arg)

  if (!Number.isNaN(v)) {
    return v
  }
  //}

  // doesn't seem to be number, so see if it's a date

  const d = parseISO(arg)

  if (!Number.isNaN(d.getTime())) {
    return d
  }

  // treat it as an actual string
  return arg
}

export function makeCells(...args: SeriesData[]): SeriesData[] {
  return args.map(arg => makeCell(arg))
}

interface ICellStrOpts {
  dp?: number
  defaultValue?: string
}

export function cellStr(cell: SeriesData, options: ICellStrOpts = {}): string {
  const { dp = 4, defaultValue = 'NA' } = { ...options }
  if (typeof cell === 'number') {
    return formatNumber(cell, dp)
  } else if (cell instanceof Date) {
    return format(cell, DEFAULT_DATE_FORMAT)
  } else {
    return cell !== null ? cell.toString() : defaultValue
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
