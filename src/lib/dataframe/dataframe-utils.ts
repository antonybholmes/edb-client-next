import { TEXT_OPEN_FILE } from '@/consts'
import { argsort } from '@lib/math/argsort'

import { ZScore } from '@lib/math/zscore'

import { mean } from '@lib/math/mean'
import { median } from '@lib/math/median'
import { range } from '@lib/math/range'
import { populationStd } from '@lib/math/stats'
import { BaseDataFrame } from './base-dataframe'

import { download } from '@lib/download-utils'
import type { IClusterGroup } from '../cluster-group'
import { cellNum, cellStr } from './cell'

import { DataIndex } from '.'
import { euclidean, type DistFunc, type Point } from '../math/distance'
import { KMeans } from '../math/kmeans'
import { AnnotationDataFrame } from './annotation-dataframe'
import { DataFrame } from './dataframe'
import type { IndexId, SeriesData } from './dataframe-types'
import { DataFrameWriter, type IDataFrameWriterOpts } from './dataframe-writer'

export type AxisDim = 0 | 1

export interface ILineFile {
  fid: string
  lines: string[]
}

export type IApplyFunc = (x: number) => number

export function add(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(x => (x as number) + a)
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
  return df.cols.map(col => cellNum(col.get(row)))
}

/**
 * Return the indices of non NA values
 * @param data
 * @returns
 */
export function filterNA(data: SeriesData[]): number[] {
  return data
    .map((v, vi) => [v, vi] as [SeriesData, number])
    .filter(v => typeof v[0] !== 'number' || !isNaN(v[0] as number))
    .map(v => v[1])
}

export function subset<T = SeriesData[] | SeriesData[]>(
  data: T[],
  idx: number[]
): T[] {
  return idx.map(i => data[i]!)
}

export function zip(...cols: SeriesData[][]): SeriesData[][] {
  const colIdx = range(cols.length)

  return range(cols[0]!.length).map(i => colIdx.map(j => cols[j]![i]!))
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
  return df.cols.map(col =>
    col.values.map(v => cellNum(v)).reduce((a, b) => a + b)
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

const DEFAULT_MATCH_OPTIONS: IMatchOptions = {
  caseSensitive: false,
  matchEntireCell: false,
  keepOrder: false,
}

export function filterColsById(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  // const {
  //   caseSensitive,
  //   matchEntireCell: entireCell,
  //   keepOrder,
  // } = {
  //   ...DEFAULT_MATCH_OPTIONS,
  //   ...options,
  // }

  // let idx: number[] = []

  // const lids = Array.from(ids).map(id =>
  //   caseSensitive ? id : id.toLowerCase()
  // )

  // if (keepOrder) {
  //   const colMap = Object.fromEntries(
  //     df.colNames.map((v, i) => [
  //       caseSensitive ? v.toString() : v.toString().toLowerCase(),
  //       i,
  //     ])
  //   )

  //   idx = lids
  //     .map(id => {
  //       if (id in colMap) {
  //         return colMap[id]!
  //       } else {
  //         return -1
  //       }
  //     })
  //     .filter(x => x !== -1)
  // } else {
  //   let index = df.colNames

  //   if (!caseSensitive) {
  //     index = index.map(s => s.toLowerCase())
  //   }

  //   if (entireCell) {
  //     idx = range(df.shape[1]).filter(i => {
  //       const n = caseSensitive ? df.colName(i) : df.colName(i).toLowerCase()
  //       return lids.includes(n) // lids.has(df.index.get(i).toString().toLowerCase())
  //     })
  //   } else {
  //     idx = range(df.shape[1]).filter(i => {
  //       const n = caseSensitive
  //         ? df.columns.get(i).toString()
  //         : df.columns.get(i).toString().toLowerCase()
  //       return lids.filter(id => n.includes(id)).length > 0 // lids.has(df.index.get(i).toString().toLowerCase())
  //     })
  //   }
  // }

  const idx = filterIndicesById(df.colNames, ids, options)

  return df.iloc(':', idx)
}

export function filterRowsById(
  df: BaseDataFrame,
  ids: string[],
  options: IMatchOptions
): BaseDataFrame {
  const idx = filterIndicesById(df.index.strs, ids, options)

  // const {
  //   caseSensitive,
  //   matchEntireCell: entireCell,
  //   keepOrder,
  // } = {
  //   ...DEFAULT_MATCH_OPTIONS,
  //   ...options,
  // }

  // let idx: number[] = []

  // const lids = ids.map(id => (caseSensitive ? id : id.toLowerCase()))

  // let index = df.index.strs

  // if (!caseSensitive) {
  //   index = index.map(s => s.toLowerCase())
  // }

  // if (keepOrder) {
  //   if (entireCell) {
  //     const rowMap = Object.fromEntries(index.map((v, i) => [v, i]))

  //     idx = lids
  //       .map(lid => {
  //         if (lid in rowMap) {
  //           return rowMap[lid]!
  //         } else {
  //           return -1
  //         }
  //       })
  //       .filter(x => x !== -1)
  //   } else {
  //     // slower partial matching

  //     for (const lid of lids) {
  //       for (const [rowi, row] of index.entries()) {
  //         if (row.includes(lid)) {
  //           idx.push(rowi)
  //         }
  //       }
  //     }
  //   }
  // } else {
  //   if (entireCell) {
  //     // idx = range(df.shape[0]).filter(i => {
  //     //   const n = caseSensitive
  //     //     ? df.index.get(i).toString()
  //     //     : df.index.get(i).toString().toLowerCase()
  //     //   return lids.includes(n) // lids.has(df.index.get(i).toString().toLowerCase())
  //     // })

  //     for (const [rowi, row] of index.entries()) {
  //       for (const lid of lids) {
  //         if (row === lid) {
  //           idx.push(rowi)
  //           break
  //         }
  //       }
  //     }
  //   } else {
  //     for (const [rowi, row] of index.entries()) {
  //       for (const lid of lids) {
  //         if (row.includes(lid)) {
  //           idx.push(rowi)
  //           break
  //         }
  //       }
  //     }

  //     // for (const lid of lids) {

  //     // console.log('hmm', df.shape[0])
  //     // idx = range(df.shape[0]).filter(i => {
  //     //   const matchIndex = caseSensitive
  //     //     ? df.index.get(i).toString()
  //     //     : df.index.get(i).toString().toLowerCase()
  //     //   return lids.filter(id => matchIndex.includes(id)).length > 0 // lids.has(df.index.get(i).toString().toLowerCase())
  //     // })

  //     //console.log('aha', idx.length)
  //   }
  // }

  return df.iloc(idx, ':')
}

function filterIndicesById(
  index: string[],
  ids: string[],
  options: IMatchOptions
): number[] {
  const {
    caseSensitive,
    matchEntireCell: entireCell,
    keepOrder,
  } = {
    ...DEFAULT_MATCH_OPTIONS,
    ...options,
  }

  let idx: number[] = []

  const lids = ids.map(id => (caseSensitive ? id : id.toLowerCase()))

  if (!caseSensitive) {
    index = index.map(s => s.toLowerCase())
  }

  if (keepOrder) {
    if (entireCell) {
      const rowMap = Object.fromEntries(index.map((v, i) => [v, i]))

      idx = lids
        .map(lid => {
          if (lid in rowMap) {
            return rowMap[lid]!
          } else {
            return -1
          }
        })
        .filter(x => x !== -1)
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
    if (entireCell) {
      // idx = range(df.shape[0]).filter(i => {
      //   const n = caseSensitive
      //     ? df.index.get(i).toString()
      //     : df.index.get(i).toString().toLowerCase()
      //   return lids.includes(n) // lids.has(df.index.get(i).toString().toLowerCase())
      // })

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

      // for (const lid of lids) {

      // console.log('hmm', df.shape[0])
      // idx = range(df.shape[0]).filter(i => {
      //   const matchIndex = caseSensitive
      //     ? df.index.get(i).toString()
      //     : df.index.get(i).toString().toLowerCase()
      //   return lids.filter(id => matchIndex.includes(id)).length > 0 // lids.has(df.index.get(i).toString().toLowerCase())
      // })

      //console.log('aha', idx.length)
    }
  }

  return idx
}

// export function findCols(df: BaseDataFrame, id: string): number[] {
//   if (id === '') {
//     return []
//   }

//   const s: string = id.toLowerCase()
//   return df.colNames
//     .map((c, ci) => (c && c.toLowerCase().includes(s) ? ci : -1))
//     .filter(x => x !== -1)
// }

// export function findCol(df: BaseDataFrame, ids: SheetId | SheetId[]): number {
//   if (ids === '') {
//     return -1
//   }

//   if (Number.isInteger(ids)) {
//     return ids as number
//   }

//   if (!Array.isArray(ids)) {
//     ids = [ids]
//   }

//   const ret: number[] = []

//   for (const id of ids) {
//     const idx = findCols(df, id.toString())

//     if (idx.length > 0) {
//       ret.push(idx[0]!)
//       break
//     }
//   }

//   if (ret.length > 0) {
//     return ret[0]!
//   }

//   return -1
// }

// /**
//  * Returns the size of the data frame.
//  * @param df a dataframe
//  * @returns the dimensions (rowsxcols) of the dataframe.
//  */
// export function getShape(df: IDataFrame): [number, number] {
//   return [df.data.length, df.data.length > 0 ? df.data[0].length : 0]
// }

export function getFormattedShape(
  df: BaseDataFrame | null | undefined
): string {
  if (!df) {
    return ''
  }

  const s = df.shape
  return `${s[0].toLocaleString()} rows x ${s[1].toLocaleString()} cols`
}

// export function getSize(df: IDataFrame): number {
//   return df.data.length * (df.data.length > 0 ? df.data[0].length : 0)
// }

export function rowJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach(df => {
    const cols = range(df.shape[1])

    cols.forEach(c => {
      const id = df.colName(c)
      countMap[id] = (countMap[id] ?? 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter(entry => entry[1] === dataFrames.length)
      .map(entry => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0]!.colNames.filter(c => ids.has(c))

  // sort other tables using these ids
  dataFrames = dataFrames.map(df => {
    const indexMap = Object.fromEntries(
      df.colNames.map((colId, ci) => [colId, ci])
    )

    const indices = orderedIds.map(id => indexMap[id]!)

    return df.iloc(':', indices) as DataFrame
  })

  return new DataFrame({
    data: dataFrames.map(df => df._data).flat(),
    columns: dataFrames[0]!.columns,
    index: new DataIndex(dataFrames.map(df => df._index.values).flat()),
  })
}

export function colJoinDataFrames(dataFrames: DataFrame[]): DataFrame {
  const countMap: { [key: string]: number } = {}

  dataFrames.forEach(df => {
    df.rowNames.forEach(id => {
      countMap[id] = (countMap[id] || 0) + 1
    })
  })

  const ids = new Set(
    Object.entries(countMap)
      .filter(entry => entry[1] === dataFrames.length)
      .map(entry => entry[0])
  )

  // get the ids in order from first table
  const orderedIds = dataFrames[0]!.rowNames.filter(rowId => ids.has(rowId))

  // sort other tables using these ids
  dataFrames = dataFrames.map(df => {
    const indexMap = Object.fromEntries(
      df.rowNames.map((rowId, rowi) => [rowId, rowi])
    )

    const indices = orderedIds.map(id => indexMap[id]!)

    return df.iloc(indices, ':') as DataFrame //filterRows(df, indices)
  })

  return new DataFrame({
    data: range(dataFrames[0]!.shape[0]).map(r =>
      dataFrames.map(df => df._data[r]!).flat()
    ),
    index: dataFrames[0]!.index,
    columns: new DataIndex(dataFrames.map(df => df.colNames).flat()),
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
  ret.rowMetaData.setCol(
    'Cluster',
    assignments.map(c => `c${c + 1}`),
    true
  )

  return [ret, assignments]
}

export function log(
  df: BaseDataFrame,
  base: 2 | 10 | 'ln',
  add: number = 0
): BaseDataFrame {
  switch (base) {
    case 2:
      return log2(df, add).setName(add > 0 ? `Log2(x + ${add})` : `Log2(x)`)

    case 10:
      return log10(df, add).setName(add > 0 ? `Log10(x + ${add})` : `Log10(x)`)

    default:
      return ln(df, add).setName(add > 0 ? `Ln(x + ${add})` : `Ln(x)`)
  }
}

export function log2(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log2((v as number) + a))
}

export function log10(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log10((v as number) + a))
}

export function ln(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply(v => Math.log((v as number) + a))
}

export function rowStdev(df: BaseDataFrame): number[] {
  return df.rowMap(row => populationStd(row as number[]))
}

export function rowMean(df: BaseDataFrame): number[] {
  return df.rowMap(row => mean(row as number[]))
}

export function rowMedian(df: BaseDataFrame): number[] {
  return df.rowMap(row => median(row as number[])[0])
}

/**
 * Returns the column means for a dataframe.
 *
 * @param df a table to process
 * @returns
 */
export function colMean(df: BaseDataFrame): number[] {
  return df.colMap(col => mean(col as number[]))
}

export function stdevFilter(df: BaseDataFrame, top = 1000) {
  const sd = rowStdev(df)

  // order from greatest std to smallest
  const idx = argsort(sd).toReversed()

  // pick the top
  const topIdx = idx.slice(0, top)

  // return a filtered matrix
  return df
    .iloc(topIdx, ':')
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
    .iloc(topIdx, ':')
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
    .iloc(topIdx, ':')
    .setName(`Filter rows using median, top ${top}`, true)
}

export function zscore(df: BaseDataFrame): BaseDataFrame {
  const z = new ZScore().fit(df.values.flat() as number[])

  return df.replaceData(df.values.map(row => z.transform(row as number[])))

  // return new AnnotationDataFrame({
  //   name: 'Row Z-score',
  //   data: z,
  //   columns: df.columns,
  //   index: df.index,
  // })
}

export function rowZScore(df: BaseDataFrame): BaseDataFrame {
  const z = df.values.map(row => new ZScore().fitTransform(row as number[]))

  return df.replaceData(z)

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

  const l1 = new Array(s[1] + 2).fill('')
  l1[0] = '#1.2'
  const l2 = new Array(s[1] + 2).fill('')
  l2[0] = s[0].toString()
  l2[1] = s[1].toString()

  const l3 = ['Name', 'Description'].concat(df.colNames)

  const d: SeriesData[][] = df.rowMap((row: SeriesData[], index: number) => {
    const n = df.index.get(index) as SeriesData
    return [n, n].concat(row)
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
  const groups = df.colNames
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

  const { file, sep, hasHeader, hasIndex } = {
    file: 'table.txt',
    sep: '\t',
    hasHeader: true,
    hasIndex: true,
    ...options,
  }

  //const f = new DataFrameWriter({ sep, hasHeader, hasIndex }).toString(df)

  const f = new DataFrameWriter({ sep, hasHeader, hasIndex }).toString(df)

  if (!f) {
    return
  }

  download(f, file)
}

export function getColIdxFromGroup(
  df: BaseDataFrame | null,
  g: IClusterGroup,
  caseSensitive = false
): number[] {
  if (!df) {
    return []
  }

  //console.log('g', g)

  const lcSearch = caseSensitive ? g.search : g.search.map(s => s.toLowerCase())

  return df.columns.values
    .map((col, ci) => ({ col: ci, name: col.toString().toLowerCase() }))
    .filter(c => {
      if (g.columnNames && g.columnNames.length > 0) {
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
            if (g.columnNames[c.col % g.columnNames.length] === x) {
              return true
            }
          } else {
            if (g.columnNames[c.col % g.columnNames.length]?.includes(x)) {
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
    .map(c => c.col)
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

  return getColIdxFromGroup(df, g, caseSensitive).map(i => df.colName(i))
}
