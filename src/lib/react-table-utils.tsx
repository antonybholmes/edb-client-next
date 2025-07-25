import { range } from '@lib/math/range'

import { cellStr, getExcelColName } from './dataframe/cell'
import type { SeriesData } from './dataframe/dataframe-types'

export interface IReactTableCol {
  id?: string
  header: unknown
  accessorKey: string
  //cell?: (props: unknown) => unknown
}

export const INDEX_COL: IReactTableCol = makeReactTableIndexCol('')

export const DEFAULT_TABLE_HEADER = [
  INDEX_COL,
  ...range(20).map(i => makeReactTableExcelCol(i)),
]

export const DEFAULT_TABLE_ROWS = range(50).map(i =>
  makeReactTableExcelIndexCell(i)
)

function _makeReactTableCol(col: string, name: string = ''): IReactTableCol {
  return {
    header: name,
    accessorKey: col,
    //cell: (props) => props.getValue(),
  }
}

export function makeReactTableCol(
  col: number,
  name: string = ''
): IReactTableCol {
  return _makeReactTableCol(`col${Math.max(0, col)}`, name)
}

export function makeReactTableExcelCol(col: number): IReactTableCol {
  const c = Math.max(0, col)
  return makeReactTableCol(c, getExcelColName(c))
}

export function makeReactTableIndexCol(name: string = ''): IReactTableCol {
  return _makeReactTableCol('index', name)
}

export function makeReactTableIndexCell(value: unknown = null) {
  return { index: value }
}

export function makeReactTableExcelIndexCell(row: number) {
  return makeReactTableIndexCell(row + 1)
}

export function makeReactTableCells(row: SeriesData[], dp: number = 4) {
  return Object.fromEntries(
    row.map((c, ci) => [`col${ci}`, cellStr(c, { dp })])
  )
}
