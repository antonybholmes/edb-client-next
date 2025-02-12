import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  log,
  meanFilter,
  medianFilter,
  rowMean,
  rowMedian,
  rowStdev,
  rowZScore,
  stdevFilter,
} from '@lib/dataframe/dataframe-utils'
import type { HistoryAction } from '@providers/history-provider'
import type { Dispatch } from 'react'

export function dfLog(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>,
  base: 2 | 10 | 'ln',
  add: number = 0
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = log(df, base, add)

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}

// export function dfLog2Plus1(
//   df: BaseDataFrame | null,
//   history: Dispatch<HistoryAction>
// ): BaseDataFrame | null {
//   return dfLog(df, history, 2, 1)
// }

export function dfTranspose(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = df.t().setName('Transpose')

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}

export function dfRowZScore(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = rowZScore(df)

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}

export function dfStdev(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>
) {
  if (!df) {
    return
  }

  const sd = rowStdev(df)

  df = df.copy().setCol('Row Stdev', sd)

  history({
    type: 'add-step',
    description: 'Add row stdev',
    sheets: [df],
  })
}

export function dfStdevFilter(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = stdevFilter(df, top)

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}

export function dfMean(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>
) {
  if (!df) {
    return
  }

  const sd = rowMean(df)

  df = df.copy().setCol('Row Mean', sd)

  history({
    type: 'add-step',
    description: 'Add row mean',
    sheets: [df],
  })
}

export function dfMeanFilter(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = meanFilter(df, top)

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}

export function dfMedian(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>
) {
  if (!df) {
    return
  }

  const sd = rowMedian(df)

  df = df.copy().setCol('Row Median', sd)

  history({
    type: 'add-step',
    description: 'Add row median',
    sheets: [df],
  })
}

export function dfMedianFilter(
  df: BaseDataFrame | null,
  history: Dispatch<HistoryAction>,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = medianFilter(df, top)

  history({
    type: 'add-step',
    description: df.name,
    sheets: [df],
  })

  return df
}
