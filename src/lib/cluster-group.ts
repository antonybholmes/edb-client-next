import { randomHexColor } from './color/color'
import { uuid } from './utils'

// export interface IBaseClusterGroup {
//   name: string
//   search: string[]
//   color: string
// }

export interface IClusterGroup {
  version: number
  id: string
  name: string
  search: string[]
  exactMatch?: boolean
  color: string
  columnNames: string[]
}

interface IGroupProps {
  name: string
  search?: string[]
  exactMatch?: boolean
  color?: string
  columnNames?: string[]
}

/**
 * Create a new empty group with sane defaults that the user
 * can update.
 *
 * @returns
 */
export function makeNewGroup(
  {
    name = 'Group 1',
    search = [],
    exactMatch = true,
    color = randomHexColor(),
    columnNames = [],
  } = {} as IGroupProps
): IClusterGroup {
  return {
    version: 2,
    id: uuid(),
    name,
    search,
    exactMatch,
    color,
    columnNames,
  }
}
