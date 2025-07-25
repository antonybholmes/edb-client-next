import type { Index } from '.'
import type { BaseSeries } from './series'

export type IndexId = number | string

export type SeriesData = IndexId | Date | boolean

export type Shape = [number, number]

export type IndexFromType = Index | SeriesData[]

export type SeriesFromType = BaseSeries | IndexFromType

export function shapesEqual(s1: Shape, s2: Shape): boolean {
  return s1[0] === s2[0] && s1[1] === s2[1]
}
