import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { vfill } from '@/lib/fill'
import { range } from '@/lib/math/range'
import { NA } from '@/lib/text/text'
import { zip } from '@/lib/utils'

import type { SeriesData } from '@/lib/dataframe/series-data'
import {
  LOC_REGEX,
  newGenomicLocation,
  parseGenomicLocation,
  type IGenomicLocation,
} from '../genomic-location'
import { BlockSearch } from './block-search'

export function oneWayFromDataframes(
  dataFrames: BaseDataFrame[]
): BaseDataFrame {
  if (dataFrames.length === 1) {
    return dataFrames[0]!
  }

  const overlapTables = dataFrames.slice(1)

  let ret = dataFrames[0]!.copy()

  ret = ret.setName(`${ret.name} one way overlap`)

  let locs: IGenomicLocation[] = []

  if (ret.get(0, 0).toString().match(LOC_REGEX)) {
    locs = ret.col(0).values.map(v => parseGenomicLocation(v as string))
  } else {
    // assume 3 col bed format

    locs = zip(ret.col(0).values, ret.col(1).values, ret.col(2).values).map(v =>
      newGenomicLocation(v[0] as string, v[1] as number, v[2] as number)
    )
  }

  //console.log(locs)

  for (const table of overlapTables) {
    const blockSearch = new BlockSearch<SeriesData[]>()

    const colNames = table.columns.map(name => `${table.name} ${name}`)

    for (const i of range(table.shape[0])) {
      let loc: IGenomicLocation

      if (table.get(i, 0).toString().match(LOC_REGEX)) {
        loc = parseGenomicLocation(table.get(i, 0).toString())
      } else {
        // assume 3 col bed format
        loc = newGenomicLocation(
          table.get(i, 0).toString(),
          table.get(i, 1) as number,
          table.get(i, 2) as number
        )
      }

      blockSearch.addFeature(loc, table.row(i).values)
    }

    const newCols = range(colNames.length).map(() => vfill(NA, ret.shape[0]))

    for (const ri of range(ret.shape[0])) {
      const loc = locs[ri]!
      const features = blockSearch.getOverlappingFeatures(loc)

      if (features.length > 0) {
        // if there are multiple features, concatenate each one
        for (const ci of range(newCols.length)) {
          const text = range(features.length)
            .map(fi => features[fi]![ci]!)
            .join(';')

          newCols[ci]![ri]! = text
        }
      }
    }

    for (const [ci, colName] of colNames.entries()) {
      ret.setCol(colName, newCols[ci]!, true)
    }
  }

  return ret
}
