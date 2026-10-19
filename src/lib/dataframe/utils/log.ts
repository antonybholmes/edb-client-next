import { BaseDataFrame } from '../base-dataframe'

export function log(
  df: BaseDataFrame,
  base: number | 'ln',
  add: number = 0
): BaseDataFrame {
  return base === 'ln'
    ? ln(df, add)
    : (df.apply((v) =>
        typeof v === 'number' ? Math.log(v + add) : v
      ) as BaseDataFrame)
}

export function log2(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.log2(v + a) : v
  ) as BaseDataFrame
}

export function log10(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.log10(v + a) : v
  ) as BaseDataFrame
}

export function ln(df: BaseDataFrame, a = 0): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.log(v + a) : v
  ) as BaseDataFrame
}
