import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import type { SeriesData } from '@/lib/dataframe'
import { fill } from '@/lib/fill'
import { range } from '@/lib/math/range'
import { NA } from '@/lib/text/text'
import { zip } from '@/lib/utils'
import { GenLoc, LOC_REGEX, parseGenLoc } from '../genomic'
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

  let locs: GenLoc[] = []

  if (ret.get(0, 0).toString().match(LOC_REGEX)) {
    locs = ret.col(0).values.map(v => parseGenLoc(v as string))
  } else {
    // assume 3 col bed format

    locs = zip(ret.col(0).values, ret.col(1).values, ret.col(2).values).map(
      v => new GenLoc(v[0] as string, v[1] as number, v[2] as number)
    )
  }

  //console.log(locs)

  for (const table of overlapTables) {
    const blockSearch = new BlockSearch<SeriesData[]>()

    const colNames = table.columns.map(name => `${table.name} ${name}`)

    for (const i of range(table.shape[0])) {
      let loc: GenLoc

      if (table.get(i, 0).toString().match(LOC_REGEX)) {
        loc = parseGenLoc(table.get(i, 0).toString())
      } else {
        // assume 3 col bed format
        loc = new GenLoc(
          table.get(i, 0).toString(),
          table.get(i, 1) as number,
          table.get(i, 2) as number
        )
      }

      blockSearch.addFeature(loc, table.row(i).values)
    }

    const newCols = range(colNames.length).map(() => fill(NA, ret.shape[0]))

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
