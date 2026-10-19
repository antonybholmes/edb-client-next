import { BaseDataFrame } from '../base-dataframe'

export function pow(df: BaseDataFrame, power: number | 'e'): BaseDataFrame {
  //const name = df.name ? df.name + ', ' : ''

  switch (power) {
    case 'e':
      return exp(df)

    default:
      return df.apply((v) => {
        return typeof v === 'number' ? Math.pow(v, power) : v
      }) as BaseDataFrame
  }
}

export function pow2(df: BaseDataFrame): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.pow(v, 2) : v
  ) as BaseDataFrame
}

export function pow10(df: BaseDataFrame): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.pow(v, 10) : v
  ) as BaseDataFrame
}

export function exp(df: BaseDataFrame): BaseDataFrame {
  return df.apply((v) =>
    typeof v === 'number' ? Math.exp(v) : v
  ) as BaseDataFrame
}
