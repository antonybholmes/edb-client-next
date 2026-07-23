import type { IDBEntity } from '@/interfaces/db-entity'
import { randomHexColor } from './color/color'
import { makeUuid } from './id'

// export interface IBaseClusterGroup {
//   name: string
//   search: string[]
//   color: string
// }

export interface IClusterGroup extends IDBEntity {
  version: number
  search: string[]
  exactMatch?: boolean
  color: string
  columns: string[]
  type: 'cluster-group'
  show: boolean
}

export interface IClusterGroupRow extends IDBEntity {
  groups: IClusterGroup[]
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
    id: makeUuid(),
    name,
    search,
    exactMatch,
    color,
    columns: columnNames,
    type: 'cluster-group',
    show: true,
  }
}
