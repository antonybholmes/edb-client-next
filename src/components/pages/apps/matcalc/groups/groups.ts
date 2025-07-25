// import type { IClusterGroup } from '@lib/cluster-group'
// import { useEffect, useState } from 'react'

// export interface IGroupsState {
//   groups: Record<string, IClusterGroup>
//   order: string[]
// }

// interface IGlobalState {
//   groupState: IGroupsState
//   listeners: Array<(groupState: IGroupsState) => void>
// }

// export const EMPTY_GROUPS: IGroupsState = {
//   groups: {},
//   order: [],
// }

// const globalState: IGlobalState = {
//   groupState: { ...EMPTY_GROUPS },
//   listeners: [],
// }

// export function addListener(listener: (groupState: IGroupsState) => void) {
//   globalState.listeners.push(listener)
//   // Return a function to remove the listener
//   return () => {
//     globalState.listeners = globalState.listeners.filter(l => l !== listener)
//   }
// }

// function addGroups(groups: IClusterGroup[]) {
//   globalState.groupState = {
//     groups: Object.fromEntries([
//       ...Object.entries(globalState.groupState.groups),
//       ...groups.map(g => [g.id, g] as [string, IClusterGroup]),
//     ]),
//     order: [...globalState.groupState.order, ...groups.map(g => g.id)],
//   }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
// }

// function setGroups(groups: IClusterGroup[]) {
//   globalState.groupState = {
//     groups: Object.fromEntries(
//       groups.map(g => [g.id, g] as [string, IClusterGroup])
//     ),
//     order: groups.map(g => g.id),
//   }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
// }

// function updateGroup(group: IClusterGroup) {
//   globalState.groupState = {
//     groups: Object.fromEntries(
//       Object.entries(globalState.groupState.groups).map(e =>
//         e[0] === group.id ? [e[0], group] : e
//       )
//     ),
//     order: globalState.groupState.order,
//   }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
// }

// function reorderGroups(order: string[]) {
//   globalState.groupState = {
//     groups: Object.fromEntries(Object.entries(globalState.groupState.groups)),
//     order,
//   }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
// }

// function deleteGroups(ids: string[]) {
//   globalState.groupState = {
//     groups: Object.fromEntries(
//       Object.entries(globalState.groupState.groups).filter(
//         e => !ids.includes(e[0]!)
//       )
//     ),
//     order: globalState.groupState.order.filter(id => !ids.includes(id)),
//   }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
// }

// function clearGroups() {
//   globalState.groupState = { ...EMPTY_GROUPS }

//   for (const listener of globalState.listeners) {
//     listener(globalState.groupState)
//   }
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
//   const [groupState, setGroupState] = useState(globalState.groupState)

//   useEffect(() => {
//     console.log('use groups')

//     // Add this component as a listener to the global state
//     const removeListener = addListener((groupState: IGroupsState) => {
//       setGroupState(groupState)
//     })

//     // Clean up the listener when the component is unmounted
//     return () => {
//       removeListener()
//     }
//   }, [])

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
