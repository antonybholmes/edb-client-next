import type { IDim } from './dim'
import type { IPos } from './pos'

export interface IRect extends IPos, IDim {}

export const EMPTY_RECT: IRect = { x: 0, y: 0, w: 0, h: 0 }

/**
 * Tests if two rectangles are equal by comparing their x, y, width (w), and height (h) properties.
 *
 * @param a The first rectangle to compare.
 * @param b The second rectangle to compare.
 * @returns True if the rectangles are equal, false otherwise.
 */
export function rectEqual(a: IRect, b: IRect) {
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h
}
