// import { type IChildrenProps } from '@interfaces/children-props'

// import type { IClusterGroup } from '@lib/cluster-group'
// import { createContext, useReducer, type Dispatch } from 'react'
// import { EMPTY_GROUPS, type IGroupsState } from './groups'

// export type GroupAction =
//   | {
//       type: 'add'
//       groups: IClusterGroup[]
//     }
//   | {
//       type: 'set'
//       groups: IClusterGroup[]
//     }
//   | {
//       type: 'update'
//       group: IClusterGroup
//     }
//   | {
//       type: 'order'
//       order: string[]
//     }
//   | {
//       type: 'remove'
//       ids: string[]
//     }
//   | { type: 'clear' }

// export function groupsReducer(
//   state: IGroupsState,
//   action: GroupAction
// ): IGroupsState {
//   console.log('group reducer', action)
//   switch (action.type) {
//     case 'add':
//       return {
//         ...state,

//         groups: Object.fromEntries([
//           ...Object.entries(state.groups),
//           ...action.groups.map(g => [g.id, g] as [string, IClusterGroup]),
//         ]),
//         order: [...state.order, ...action.groups.map(g => g.id)],
//       }

//     case 'set':
//       console.log('group set')
//       return {
//         groups: Object.fromEntries(
//           action.groups.map(g => [g.id, g] as [string, IClusterGroup])
//         ),
//         order: action.groups.map(g => g.id),
//       }
//     case 'order':
//       return {
//         ...state,
//         order: action.order,
//       }
//     case 'update':
//       return {
//         ...state,
//         groups: Object.fromEntries(
//           Object.entries(state.groups).map(e =>
//             e[0] === action.group.id ? [e[0], action.group] : e
//           )
//         ),
//       }
//     case 'remove':
//       const ids = new Set<string>(action.ids)
//       return {
//         ...state,
//         groups: Object.fromEntries(
//           Object.entries(state.groups).filter(e => !ids.has(e[0]!))
//         ),
//         order: state.order.filter(id => !ids.has(id)),
//       }

//     case 'clear':
//       return { ...state, groups: {}, order: [] }

//     default:
//       return state
//   }
// }

// export const GroupsContext = createContext<{
//   groupState: IGroupsState
//   groupsDispatch: Dispatch<GroupAction>
// }>({ groupState: { ...EMPTY_GROUPS }, groupsDispatch: () => {} })

// export function GroupsProvider({ children }: IChildrenProps) {
//   const [groupState, groupsDispatch] = useReducer(groupsReducer, {
//     ...EMPTY_GROUPS,
//   })

//   return (
//     <GroupsContext.Provider value={{ groupState, groupsDispatch }}>
//       {children}
//     </GroupsContext.Provider>
//   )
// }
