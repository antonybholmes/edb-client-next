import { type IChildrenProps } from '@interfaces/children-props'

import type { IClusterGroup } from '@lib/cluster-group'
import { createContext, useReducer, type Dispatch } from 'react'

export type GroupAction =
  | {
      type: 'add'
      groups: IClusterGroup[]
    }
  | {
      type: 'set'
      groups: IClusterGroup[]
    }
  | {
      type: 'update'
      group: IClusterGroup
    }
  | {
      type: 'order'
      order: string[]
    }
  | {
      type: 'remove'
      ids: string[]
    }
  | { type: 'clear' }

interface IGroupsState {
  groups: Map<string, IClusterGroup>
  order: string[]
}

export function groupsReducer(
  state: IGroupsState,
  action: GroupAction
): IGroupsState {
  switch (action.type) {
    case 'add':
      return {
        ...state,

        groups: new Map<string, IClusterGroup>([
          ...[...state.groups.entries()],
          ...action.groups.map(g => [g.id, g] as [string, IClusterGroup]),
        ]),
        order: [...state.order, ...action.groups.map(g => g.id)],
      }

    case 'set':
      return {
        ...state,

        groups: new Map<string, IClusterGroup>(
          action.groups.map(g => [g.id, g] as [string, IClusterGroup])
        ),
        order: action.groups.map(g => g.id),
      }
    case 'order':
      return {
        ...state,
        order: action.order,
      }
    case 'update':
      return {
        ...state,
        groups: new Map<string, IClusterGroup>(
          [...state.groups.entries()].map(e =>
            e[0] === action.group.id ? [e[0], action.group] : e
          )
        ),
      }
    case 'remove':
      const ids = new Set<string>(action.ids)
      return {
        ...state,
        groups: new Map<string, IClusterGroup>(
          [...state.groups.entries()].filter(e => !ids.has(e[0]!))
        ),
        order: state.order.filter(id => !ids.has(id)),
      }

    case 'clear':
      return { ...state, groups: new Map<string, IClusterGroup>(), order: [] }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

// const SettingsContext = createContext<{
//   value: ITab | undefined
//   onValueChange: (tab: ITab) => void
//   onCheckedChange: (tab: ITab, state: boolean) => void
// }>({
//   value: undefined,
//   onValueChange: () => {},
//   onCheckedChange: () => {},
// })

const EMPTY_STATE: IGroupsState = {
  groups: new Map<string, IClusterGroup>(),
  order: [],
}

export const GroupsContext = createContext<{
  groupState: IGroupsState
  groupsDispatch: Dispatch<GroupAction>
}>({ groupState: { ...EMPTY_STATE }, groupsDispatch: () => {} })

export function GroupsProvider({ children }: IChildrenProps) {
  const [groupState, groupsDispatch] = useReducer(groupsReducer, {
    ...EMPTY_STATE,
  })

  return (
    <GroupsContext.Provider value={{ groupState, groupsDispatch }}>
      {children}
    </GroupsContext.Provider>
  )
}
