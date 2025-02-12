import type { IGeneset } from '@/lib/gsea/geneset'
import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

export type GeneSetAction =
  | {
      type: 'add'
      genesets: IGeneset[]
    }
  | {
      type: 'set'
      genesets: IGeneset[]
    }
  | {
      type: 'update'
      geneset: IGeneset
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
  genesets: Map<string, IGeneset>
  order: string[]
}

export function groupsReducer(
  state: IGroupsState,
  action: GeneSetAction
): IGroupsState {
  switch (action.type) {
    case 'add':
      return {
        ...state,

        genesets: new Map<string, IGeneset>([
          ...[...state.genesets.entries()],
          ...action.genesets.map(g => [g.id, g] as [string, IGeneset]),
        ]),
        order: [...state.order, ...action.genesets.map(g => g.id)],
      }

    case 'set':
      return {
        ...state,

        genesets: new Map<string, IGeneset>(
          action.genesets.map(g => [g.id, g] as [string, IGeneset])
        ),
        order: action.genesets.map(g => g.id),
      }
    case 'order':
      return {
        ...state,
        order: action.order,
      }
    case 'update':
      return {
        ...state,
        genesets: new Map<string, IGeneset>(
          [...state.genesets.entries()].map(e =>
            e[0] === action.geneset.id ? [e[0], action.geneset] : e
          )
        ),
      }
    case 'remove':
      const ids = new Set<string>(action.ids)
      return {
        ...state,
        genesets: new Map<string, IGeneset>(
          [...state.genesets.entries()].filter(e => !ids.has(e[0]!))
        ),
        order: state.order.filter(id => !ids.has(id)),
      }

    case 'clear':
      return { ...state, genesets: new Map<string, IGeneset>(), order: [] }

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
  genesets: new Map<string, IGeneset>(),
  order: [],
}

export const GenesetsContext = createContext<{
  genesetState: IGroupsState
  genesetDispatch: Dispatch<GeneSetAction>
}>({ genesetState: { ...EMPTY_STATE }, genesetDispatch: () => {} })

export function GenesetsProvider({ children }: IChildrenProps) {
  const [genesetState, genesetDispatch] = useReducer(groupsReducer, {
    ...EMPTY_STATE,
  })

  return (
    <GenesetsContext.Provider value={{ genesetState, genesetDispatch }}>
      {children}
    </GenesetsContext.Provider>
  )
}
