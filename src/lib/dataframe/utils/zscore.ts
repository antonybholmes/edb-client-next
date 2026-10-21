import { ZScore } from '@/lib/math/stats/zscore'
import { BaseDataFrame } from '../base-dataframe'

export function zscore(df: BaseDataFrame): BaseDataFrame {
  const z = new ZScore().fit(df.values.flat() as number[])

  return df.copyReplaceData(
    df.values.map((row) => z.transform(row as number[]))
  ) as BaseDataFrame

  // return new AnnotationDataFrame({
  //   name: 'Row Z-score',
  //   data: z,
  //   columns: df.columns,
  //   index: df.index,
  // })
}

export function rowZScore(df: BaseDataFrame): BaseDataFrame {
  const z = df.values.map((row) => new ZScore().fitTransform(row as number[]))

  const ret = df.copyReplaceData(z) as BaseDataFrame

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
  return rowZScore(df.t as BaseDataFrame).t as BaseDataFrame
}
