import { BaseDataFrame } from '../base-dataframe'

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
