// import { APP_ID } from '@/consts'
// import type { IClusterGroup } from '@lib/cluster-group'
// import { persistentAtom } from '@nanostores/persistent'
// import { useStore } from '@nanostores/react'
// import MODULE_INFO from '../module.json'
// import { EMPTY_GROUPS, type IGroupsState } from './groups'

// // for persistent storage of groups

// const KEY = `${APP_ID}:module:${MODULE_INFO.name.toLowerCase()}:groups:settings:v2`

// export const groupsAtom = persistentAtom<IGroupsState>(
//   KEY,
//   {
//     ...EMPTY_GROUPS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function addGroups(groups: IClusterGroup[]) {
//   groupsAtom.set({
//     groups: Object.fromEntries([
//       ...Object.entries(groupsAtom.get().groups),
//       ...groups.map(g => [g.id, g] as [string, IClusterGroup]),
//     ]),
//     order: [...groupsAtom.get().order, ...groups.map(g => g.id)],
//   })
// }

// function setGroups(groups: IClusterGroup[]) {
//   groupsAtom.set({
//     groups: Object.fromEntries(
//       groups.map(g => [g.id, g] as [string, IClusterGroup])
//     ),
//     order: groups.map(g => g.id),
//   })
// }

// function updateGroup(group: IClusterGroup) {
//   groupsAtom.set({
//     groups: Object.fromEntries(
//       Object.entries(groupsAtom.get().groups).map(e =>
//         e[0] === group.id ? [e[0], group] : e
//       )
//     ),
//     order: groupsAtom.get().order,
//   })
// }

// function reorderGroups(order: string[]) {
//   groupsAtom.set({
//     groups: groupsAtom.get().groups,
//     order,
//   })
// }

// function deleteGroups(ids: string[]) {
//   groupsAtom.set({
//     groups: Object.fromEntries(
//       Object.entries(groupsAtom.get().groups).filter(e => !ids.includes(e[0]!))
//     ),
//     order: groupsAtom.get().order.filter(id => !ids.includes(id)),
//   })
// }

// function clearGroups() {
//   groupsAtom.set({
//     groups: {},
//     order: [],
//   })
// }

// export function useGroups(): {
//   groupState: IGroupsState
//   addGroups: (groups: IClusterGroup[]) => void
//   setGroups: (groups: IClusterGroup[]) => void
//   updateGroup: (group: IClusterGroup) => void
//   reorderGroups: (order: string[]) => void
//   deleteGroups: (ids: string[]) => void
//   clearGroups: () => void
// } {
//   const groupState = useStore(groupsAtom)

//   return {
//     groupState,
//     addGroups,
//     setGroups,
//     updateGroup,
//     reorderGroups,
//     deleteGroups,
//     clearGroups,
//   }
// }
