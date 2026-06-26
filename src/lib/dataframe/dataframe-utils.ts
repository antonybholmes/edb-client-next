import { TEXT_OPEN_FILE } from '@/consts'
import { argsort } from '@/lib/math/argsort'

import { ZScore } from '@/lib/math/zscore'

import { mean } from '@/lib/math/mean'
import { median } from '@/lib/math/median'
import { range } from '@/lib/math/range'
import { populationStd } from '@/lib/math/stats'
import { BaseDataFrame } from './base-dataframe'

import { download } from '@/lib/download-utils'
import type { IClusterGroup } from '../cluster-group'
import { cellNum, cellStr } from './cell'

import { euclidean, type DistFunc, type Point } from '../math/distance'
import { KMeans } from '../math/kmeans'
import { AnnotationDataFrame } from './annotation-dataframe'
import { DataFrame } from './dataframe'

import { DataIndex, strs } from '.'
import { vfill } from '../fill'
import { DataFrameWriter, type IDataFrameWriterOpts } from './dataframe-writer'
import type { IndexId, SeriesData } from './series-data'

export type AxisDim = 0 | 1

export interface ILineFile {
  fid: string
  lines: string[]
}

export type IApplyFunc = (x: number) => number

export function add(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((x) => (x as number) + a)
}

export function getNumCol(df: BaseDataFrame, col: IndexId = 0): number[] {
  const c = df.col(col)
  return c ? c.values.map((v: SeriesData) => cellNum(v)) : []
}

export function getStrCol(df: BaseDataFrame, col = 0): string[] {
  const c = df.col(col)
  return c ? c.values.map((v: SeriesData) => cellStr(v)) : []
}

export function getNumRow(df: BaseDataFrame, row: number = 0): number[] {
  return df.cols.map((col) => cellNum(col.get(row)))
}

/**
 * Return the indices of non NA values
 * @param data
 * @returns
 */
export function filterNA(data: SeriesData[]): number[] {
  return data
    .map((v, vi) => [v, vi] as [SeriesData, number])
    .filter((v) => typeof v[0] !== 'number' || !isNaN(v[0] as number))
    .map((v) => v[1])
}

export function subset<T = SeriesData[] | SeriesData[]>(
  data: T[],
  idx: number[]
): T[] {
  return idx.map((i) => data[i]!)
}

export function zip(...cols: SeriesData[][]): SeriesData[][] {
  const colIdx = range(cols.length)

  return range(cols[0]!.length).map((i) => colIdx.map((j) => cols[j]![i]!))
}

/**
 * Returns the indices of an array that would make it sorted.
 *
 * @param data an array to sort
 * @returns The indices of the array to make it sorted
 */

export function rowSums(df: BaseDataFrame): number[] {
  return df.rowMap((row: SeriesData[]) =>
    row.reduce((a: number, b: SeriesData) => a + (b as number), 0)
  )

  // return range(df.shape[0]).map(row =>
  //   df.cols.map(col => cellNum(col.get(row))).reduce((a, b) => a + b),
  // )
}

export function rowDiv(df: BaseDataFrame, values: number[]): BaseDataFrame {
  const data = df.map(
    (v: SeriesData, row: number) => (v as number) / values[row]!
  )

  return new DataFrame({
    name: df.name,
    data,
    columns: df.columns,
    index: df.index,
  })
}

export function colSums(df: BaseDataFrame): number[] {
  return df.cols.map((col) =>
    col.values.map((v) => cellNum(v)).reduce((a, b) => a + b)
  )
}

// /**
//  *
//  * @param index an index to filter
//  * @param idx the rows or columns to extract
//  * @returns
//  */
// export function filterIndex(
//   index: Series[],
//   indices: number[]
// ): Series[] {
//   return index.map(idx => ({
//     name: idx.name,
//     ids: _boundIdx(indices, idx.ids).map(ri => idx.ids[ri]),
//   }))
// }

// export function filterRows(df: BaseDataFrame, idx: number[]): DataFrame {
//   return new DataFrame({
//     data: idx.map(i => df.values[i]),
//     name: df.name,
//     columns: df.columns,
//   })
// }

// export function filterCols(df: BaseDataFrame, idx: number[]): DataFrame {
//   return new DataFrame({
//     data: df.values.map(row => idx.map(i => row[i])),
//     name: df.name,
//     columns: df.columns.filter(idx),
//   })
// }

// export function sliceRows(
//   df: DataFrame,
//   start: number = 0,
//   end: number = 100,
// ): BaseDataFrame {
//   return filterRows(df, range(start, end))
// }

// export function filterCols(df: BaseDataFrame, idx: number[]): BaseDataFrame {
//   idx = _boundIdx(idx, df.shape[1])

//   return DataFrame.fromSeries(
//     idx
//       .map(i => df.col(i))
//       .filter(x => x)
//       .map(x => x as BaseSeries),
//   )
//     .setName(df.name)
//     .setIndex(df.index)
// }

// /**
//  * Slice columns out of data files.
//  *
//  * @param files
//  * @param cols
//  * @returns
//  */
// export function sliceCols(
//   df: BaseDataFrame,
//   start = 0,
//   end = 100,
// ): BaseDataFrame {
//   return filterCols(df, range(start, end))
// }

export function rowIdxMap(
  df: BaseDataFrame,
  lowercase: boolean = false
): { [key: string]: number } {
  const ret: { [key: string]: number } = {}

  df.index?.values.map((rowId, rowi) => {
    if (rowId) {
      const s = rowId.toString()
      ret[lowercase ? s.toLowerCase() : s] = rowi
    }
  })

  return ret
}

interface IMatchOptions {
  caseSensitive?: boolean
  matchEntireCell?: boolean
  keepOrder?: boolean
}

export function findCols(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  const idx = findIndices(df.columns, ids, options)

  return df.iloc({ cols: idx })
}

export function findRows(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  const idx = findIndices(df.index.strs, ids, options)

  return df.iloc({ rows: idx })
}

function findIndices(
  index: string[],
  ids: string[],
  options: IMatchOptions
): number[] {
  const {
    caseSensitive = false,
    matchEntireCell = false,
    keepOrder = false,
  } = options

  let idx: number[] = []

  const lids = ids.map((id) => (caseSensitive ? id : id.toLowerCase()))

  if (!caseSensitive) {
    index = index.map((s) => s.toLowerCase())
  }

  if (keepOrder) {
    if (matchEntireCell) {
      const rowMap = Object.fromEntries(index.map((v, i) => [v, i]))

      idx = lids
        .map((lid) => {
          if (lid in rowMap) {
            return rowMap[lid]!
          } else {
            return -1
          }
        })
        .filter((x) => x !== -1)
    } else {
      // slower partial matching

      for (const lid of lids) {
        for (const [rowi, row] of index.entries()) {
          if (row.includes(lid)) {
            idx.push(rowi)
          }
        }
      }
    }
  } else {
    if (matchEntireCell) {
      for (const [rowi, row] of index.entries()) {
        for (const lid of lids) {
          if (row === lid) {
            idx.push(rowi)
            break
          }
        }
      }
    } else {
      for (const [rowi, row] of index.entries()) {
        for (const lid of lids) {
          if (row.includes(lid)) {
            idx.push(rowi)
            break
          }
        }
      }
    }
  }

  return idx
}

export function getFormattedShape(
  df: BaseDataFrame | null | undefined
): string {
  if (!df) {
    return ''
  }

  const s = df.shape
  return `${s[0].toLocaleString()} rows x ${s[1].toLocaleString()} cols`
}

export function getFormattedShapeSmall(
  df: BaseDataFrame | null | undefined
): string {
  if (!df) {
    return ''
  }

  const s = df.shape
  return `${s[0].toLocaleString()} x ${s[1].toLocaleString()}`
}

// export function getSize(df: IDataFrame): number {
//   return df.data.length * (df.data.length > 0 ? df.data[0].length : 0)
// }

export function rowJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach((df) => {
    const cols = range(df.shape[1])

    cols.forEach((c) => {
      const id = df.colName(c)
      countMap[id] = (countMap[id] ?? 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter((entry) => entry[1] === dataFrames.length)
      .map((entry) => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0]!.columns.filter((c) => ids.has(c))

  // sort other tables using these ids
  dataFrames = dataFrames.map((df) => {
    const indexMap = Object.fromEntries(
      df.columns.map((colId, ci) => [colId, ci])
    )

    const indices = orderedIds.map((id) => indexMap[id]!)

    return df.iloc({ cols: indices }) as DataFrame
  })

  return new DataFrame({
    data: dataFrames.map((df) => df._data).flat(),
    columns: dataFrames[0]!.columns,
    index: new DataIndex(dataFrames.map((df) => df._index.values).flat()),
  })
}

export function colJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach((df) => {
    df.rowNames.forEach((id) => {
      countMap[id] = (countMap[id] || 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter((entry) => entry[1] === dataFrames.length)
      .map((entry) => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0]!.rowNames.filter((rowId) => ids.has(rowId))

  // sort other tables using these ids
  dataFrames = dataFrames.map((df) => {
    const indexMap = Object.fromEntries(
      df.rowNames.map((rowId, rowi) => [rowId, rowi])
    )

    const indices = orderedIds.map((id) => indexMap[id]!)

    return df.iloc({ rows: indices }) as DataFrame //filterRows(df, indices)
  })

  return new DataFrame({
    data: range(dataFrames[0]!.shape[0]).map((r) =>
      dataFrames.map((df) => df._data[r]!).flat()
    ),
    index: dataFrames[0]!.index,
    columns: new DataIndex(dataFrames.map((df) => df.columns).flat()),
  })
}

export function joinDataFrames(
  df: DataFrame[],
  axis: AxisDim = 0
): BaseDataFrame {
  if (axis === 0) {
    return rowJoinDataFrames(df)
  } else {
    return colJoinDataFrames(df)
  }
}

export function kmeans(
  df: AnnotationDataFrame,
  clusters: number = 5,
  d: DistFunc = euclidean
): [AnnotationDataFrame, number[]] {
  const k = new KMeans(clusters, d)

  const { assignments } = k.fit(df.values as Point[])

  const ret = df.copy() as AnnotationDataFrame

  // we use use clusters starting from 1
  ret.rowObs.setCol(
    'Cluster',
    assignments.map((c) => `c${c + 1}`),
    true
  )

  return [ret, assignments]
}

export function log(
  df: BaseDataFrame,
  base: 2 | 10 | 'ln',
  add: number = 0
): BaseDataFrame {
  //const name = df.name ? df.name + ', ' : ''

  switch (base) {
    case 2:
      return log2(df, add) //.setName( add > 0 ? name + `Log2(x+${add})` : name + `Log2(x)`)

    case 10:
      return log10(df, add) //.setName(add > 0 ? name + `Log10(x+${add})` : name + `Log10(x)`)

    default:
      return ln(df, add) //.setName(add > 0 ? name + `Ln(x+${add})` : name + `Ln(x)`)
  }
}

export function log2(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) => Math.log2((v as number) + a))
}

export function log10(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) => Math.log10((v as number) + a))
}

export function ln(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) => Math.log((v as number) + a))
}

export function rowStdev(df: BaseDataFrame): number[] {
  return df.rowMap((row) => populationStd(row as number[]))
}

export function rowMean(df: BaseDataFrame): number[] {
  return df.rowMap((row) => mean(row as number[]))
}

export function rowMedian(df: BaseDataFrame): number[] {
  return df.rowMap((row) => median(row as number[])[0])
}

/**
 * Returns the column means for a dataframe.
 *
 * @param df a table to process
 * @returns
 */
export function colMean(df: BaseDataFrame): number[] {
  return df.colMap((col) => mean(col as number[]))
}

export function stdevFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowStdev(df)

  // order from greatest std to smallest
  const idx = argsort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc({ rows: topIdx })
    .setName(`Filter rows using stdev, top ${top}`, true)
}

export function meanFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowMean(df)

  // order from greatest std to smallest
  const idx = argsort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc({ rows: topIdx })
    .setName(`Filter rows using mean, top ${top}`, true)
}

export function medianFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowMedian(df)

  // order from greatest std to smallest
  const idx = argsort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc({ rows: topIdx })
    .setName(`Filter rows using median, top ${top}`, true)
}

export function zscore(df: BaseDataFrame): BaseDataFrame {
  const z = new ZScore().fit(df.values.flat() as number[])

  return df.replace(df.values.map((row) => z.transform(row as number[])))

  // return new AnnotationDataFrame({
  //   name: 'Row Z-score',
  //   data: z,
  //   columns: df.columns,
  //   index: df.index,
  // })
}

export function rowZScore(df: BaseDataFrame): BaseDataFrame {
  const z = df.values.map((row) => new ZScore().fitTransform(row as number[]))

  const ret = df.replace(z)

  //const name = df.name ? df.name + ', ' : ''

  return ret //.setName(name + 'Row Z-score')

  // return new AnnotationDataFrame({
  //   name: 'Row Z-score',
  //   data: z,
  //   columns: df.columns,
  //   index: df.index,
  // })
}

export function colZScore(df: BaseDataFrame): BaseDataFrame {
  // do not generate a new motif for the second transpose since
  // me made a clone for the first
  return rowZScore(df.t).t
}

export function makeGCT(df: BaseDataFrame): BaseDataFrame {
  const s = df.shape

  const l1 = vfill('', s[1] + 2) // new Array(s[1] + 2).fill('')
  l1[0] = '#1.2'
  const l2 = vfill('', s[1] + 2)
  l2[0] = s[0].toString()
  l2[1] = s[1].toString()

  const l3 = ['Name', 'Description'].concat(df.columns)

  const d: string[][] = df.rowMap((row: SeriesData[], index: number) => {
    const n = df.index.str(index)
    return [n, n].concat(strs(row))
  })

  // const d = df.values.map((r, ri) => {
  //   const n = df.index.get(ri)

  //   return [n, n].concat(r as )
  // })

  return new AnnotationDataFrame({
    name: 'GCT',
    data: [l1, l2, l3].concat(d),
  })
}

export function getDataFrameInfo(df: BaseDataFrame | undefined | null): string {
  return df !== null ? getFormattedShape(df) : TEXT_OPEN_FILE
}

export interface ID3Item {
  cell: [number, number]
  group: string
  variable: string
  value: number
}

/**
 * Convert dataframe to a d3 structure.
 *
 * @param df  a dataframe
 * @returns   data as an array of maps suitable for d3
 */
export function dataframeToD3(df: BaseDataFrame): ID3Item[] {
  const groups = df.columns
  const variables = df.rowNames

  return df.values
    .map((row, ri) =>
      row.map((value, ci) => ({
        cell: [ri, ci] as [number, number],
        group: groups[ci]!,
        variable: variables[ri]!,
        value: value as number,
      }))
    )
    .flat()
}

interface IDownloadOptions extends IDataFrameWriterOpts {
  file?: string
}

export function downloadDataFrame(
  df: AnnotationDataFrame | null | undefined,
  options: IDownloadOptions = {}
) {
  if (!df) {
    return
  }

  const {
    file = 'table.txt',
    sep = '\t',
    hasHeader = true,
    hasIndex = true,
    dp = 4,
  } = options

  //const f = new DataFrameWriter({ sep, hasHeader, hasIndex }).toString(df)

  const f = new DataFrameWriter({ sep, hasHeader, hasIndex, dp }).toString(df)

  if (!f) {
    return
  }

  download(f, file)
}

/**
 * Given a dataframe and a clustergroup, return the column indices matching the group.
 *
 * @param df  a dataframe
 * @param g   a cluster group
 * @param caseSensitive  whether to match case sensitively
 * @returns  an array of column indices
 */
export function getColIdxFromGroup(
  df: BaseDataFrame | null,
  g: IClusterGroup,
  caseSensitive = false
): number[] {
  if (!df) {
    return []
  }

  const lcSearch = caseSensitive
    ? g.search
    : g.search.map((s) => s.toLowerCase())

  return df.columns
    .map((col, ci) => ({ col: ci, name: col.toLowerCase() }))
    .filter((c) => {
      if (g.columns && g.columns.length > 0) {
        // search via cls so use the cls definitions of columns
        // and check that the search, .e.g het
        // # het cbp
        // # het het het cpb cbp cbp
        // In this situation, columnNames will be het het het cpb cbp cbp for
        // every group created from the cls file. That way it uses the search
        // param to look within columNames to see if the current position c.col
        // matches the search. This is used in place of searching the regular
        // column names of the dataframe and assumes that the columnNames refers
        // to the alternative names of the columns of the current dataframe. If
        // this is not the case, reload the groups after loading a table to ensure
        // they are correctly synced.
        for (const x of lcSearch) {
          if (g.exactMatch) {
            if (g.columns[c.col % g.columns.length] === x) {
              return true
            }
          } else {
            if (g.columns[c.col % g.columns.length]?.includes(x)) {
              return true
            }
          }
        }
      } else {
        if (g.exactMatch) {
          for (const x of lcSearch) {
            if (c.name === x) {
              return true
            }
          }
        } else {
          for (const x of lcSearch) {
            if (c.name.includes(x)) {
              return true
            }
          }
        }
      }
      return false
    })
    .map((c) => c.col)
}

/**
 * Given a dataframe and a clustergroup, return the columns matching the group.
 *
 * @param df
 * @param g
 * @param caseSensitive
 * @returns
 */
export function getColNamesFromGroup(
  df: BaseDataFrame | null,
  g: IClusterGroup,
  caseSensitive = false
): string[] {
  if (!df) {
    return []
  }

  return getColIdxFromGroup(df, g, caseSensitive).map((i) => df.colName(i))
}
