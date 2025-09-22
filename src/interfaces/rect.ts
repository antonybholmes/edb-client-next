import { IDim } from './dim'
import { IPos } from './pos'

export interface IRect extends IPos, IDim {}

export const NO_RECT: IRect = { x: -1, y: -1, w: -1, h: -1 }
