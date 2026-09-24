export interface ILimit {
  min: number
  max: number
}

export const DEFAULT_LIMIT: ILimit = {
  min: 0,
  max: 1,
}

export interface IRange {
  start: number
  end: number
}
