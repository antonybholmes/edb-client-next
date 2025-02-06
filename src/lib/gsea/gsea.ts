import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  getColIdxFromGroup,
  rowMean,
  rowStdev,
} from '@lib/dataframe/dataframe-utils'
import { add, sub } from '@lib/math/add'
import { argsort } from '@lib/math/argsort'
import { div } from '@lib/math/multiply'
import type { IClusterGroup } from '../cluster-group'
import type { IRankedGenes } from './geneset'

export function snrRankGenes(
  df: BaseDataFrame,
  group1: IClusterGroup,
  group2: IClusterGroup,
  epsilon: number = 1e-100
): IRankedGenes {
  // split table for each group
  const tables = [group1, group2].map((group) => {
    const colIdx = getColIdxFromGroup(df, group)
    return df!.iloc(':', colIdx)
  })

  const names = df.index.strs

  const means = tables.map((df) => rowMean(df))

  const sds = tables.map((df) => rowStdev(df))

  const meanDiffs = sub(means[0]!, means[1]!)

  // add small error so that we never have std 0
  const sdSum = add(add(sds[0]!, sds[1]!), epsilon)
  const snr = div(meanDiffs, sdSum)

  const idx = argsort(snr).toReversed()

  return {
    group1,
    group2,
    genes: idx.map((i, rank) => ({ name: names[i]!, score: snr[i]!, rank })),
  }
}
