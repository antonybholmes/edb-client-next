import { randomHexColor } from './color'
import { nanoid } from './utils'

// export interface IBaseClusterGroup {
//   name: string
//   search: string[]
//   color: string
// }

export interface IClusterGroup {
  id: string
  name: string
  search: string[]
  color: string
  columnNames?: string[]
}

/**
 * Create a new empty group with sane defaults, that the user
 * will update to what they actually want to search for.
 *
 * @returns
 */
export function makeNewGroup(name: string = 'Group 1'): IClusterGroup {
  return {
    id: nanoid(),
    name,
    search: [],
    color: randomHexColor(),
  }
}
