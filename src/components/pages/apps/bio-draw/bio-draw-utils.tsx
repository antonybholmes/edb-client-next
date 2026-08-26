import type { IPos } from '@/interfaces/pos'

export interface IPoint extends IPos {
  type: 'control' | 'inter'
  d: number
  //index: number
}

export type ExportedState = {
  type: 'lipid'
  id: string
  points: IPoint[]
}

export type ExportHandle = {
  exportState: () => ExportedState
}
