import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { type BaseDataFrame } from '@lib/dataframe/base-dataframe'
import {
  kmeans,
  log,
  meanFilter,
  medianFilter,
  rowMean,
  rowMedian,
  rowStdev,
  rowZScore,
  stdevFilter,
} from '@lib/dataframe/dataframe-utils'
type HistoryAddStep = (description: string, sheets: BaseDataFrame[]) => void

export function dfKmeans(
  df: AnnotationDataFrame | null,
  addStep: HistoryAddStep,
  clusters: number = 5
): AnnotationDataFrame | null {
  if (!df) {
    return null
  }

  df = kmeans(df, clusters)[0]

  addStep(df.name, [df])

  return df
}

export function dfLog(
  df: BaseDataFrame | null,
  addStep: HistoryAddStep,
  base: 2 | 10 | 'ln',
  add: number = 0
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = log(df, base, add)

  addStep(df.name, [df])

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
  addStep: HistoryAddStep
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = df.t.setName('Transpose')

  addStep(df.name, [df])

  return df
}

export function dfRowZScore(
  df: BaseDataFrame | null,
  addStep: HistoryAddStep
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = rowZScore(df)

  addStep(df.name, [df])

  return df
}

export function dfStdev(df: BaseDataFrame | null, addStep: HistoryAddStep) {
  if (!df) {
    return
  }

  const sd = rowStdev(df)

  df = df.copy()
  ;(df as AnnotationDataFrame).rowMetaData.setCol('Row Stdev', sd, true)

  //df.setCol('Row Stdev', sd, true)

  addStep(df.name, [df])
}

export function dfStdevFilter(
  df: BaseDataFrame | null,
  addStep: HistoryAddStep,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = stdevFilter(df, top)

  addStep(df.name, [df])
  return df
}

export function dfMean(df: BaseDataFrame | null, addStep: HistoryAddStep) {
  if (!df) {
    return
  }

  const sd = rowMean(df)

  df = df.copy().setCol('Row Mean', sd, true)

  addStep(df.name, [df])
}

export function dfMeanFilter(
  df: BaseDataFrame | null,
  addStep: HistoryAddStep,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = meanFilter(df, top)

  addStep(df.name, [df])

  return df
}

export function dfMedian(df: BaseDataFrame | null, addStep: HistoryAddStep) {
  if (!df) {
    return
  }

  const sd = rowMedian(df)

  df = df.copy().setCol('Row Median', sd, true)

  addStep(df.name, [df])
}

export function dfMedianFilter(
  df: BaseDataFrame | null,
  addStep: HistoryAddStep,
  top = 1000
): BaseDataFrame | null {
  if (!df) {
    return null
  }

  df = medianFilter(df, top)

  addStep(df.name, [df])

  return df
}
