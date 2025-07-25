// import { APP_ID } from '@/consts'
// import type { IGeneset } from '@lib/gsea/geneset'
// import { persistentAtom } from '@nanostores/persistent'
// import { useStore } from '@nanostores/react'
// import MODULE_INFO from '../module.json'

// import { useEffect, useReducer, type Dispatch } from 'react'

// const KEY = `${APP_ID}:module:${MODULE_INFO.name.toLowerCase()}:genesets:settings:v1`

// export type GeneSetAction =
//   | {
//       type: 'add'
//       genesets: IGeneset[]
//     }
//   | {
//       type: 'set'
//       genesets: IGeneset[]
//     }
//   | {
//       type: 'update'
//       geneset: IGeneset
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

// export interface IGenesetState {
//   genesets: Record<string, IGeneset>
//   order: string[]
// }

// export function genesetsReducer(
//   state: IGenesetState,
//   action: GeneSetAction
// ): IGenesetState {
//   switch (action.type) {
//     case 'add':
//       return {
//         ...state,

//         genesets: Object.fromEntries([
//           ...Object.entries(state.genesets),
//           ...action.genesets.map(g => [g.id, g] as [string, IGeneset]),
//         ]),
//         order: [...state.order, ...action.genesets.map(g => g.id)],
//       }

//     case 'set':
//       return {
//         ...state,

//         genesets: Object.fromEntries(
//           action.genesets.map(g => [g.id, g] as [string, IGeneset])
//         ),
//         order: action.genesets.map(g => g.id),
//       }
//     case 'order':
//       return {
//         ...state,
//         order: action.order,
//       }
//     case 'update':
//       return {
//         ...state,
//         genesets: Object.fromEntries(
//           Object.entries(state.genesets).map(e =>
//             e[0] === action.geneset.id ? [e[0], action.geneset] : e
//           )
//         ),
//       }
//     case 'remove':
//       const ids = new Set<string>(action.ids)
//       return {
//         ...state,
//         genesets: Object.fromEntries(
//           Object.entries(state.genesets).filter(e => !ids.has(e[0]!))
//         ),
//         order: state.order.filter(id => !ids.has(id)),
//       }

//     case 'clear':
//       return { ...state, genesets: {}, order: [] }

//     default:
//       return state
//   }
// }

// // const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
// //   historyReducer,
// //   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// // )

// // const SettingsContext = createContext<{
// //   value: ITab | undefined
// //   onValueChange: (tab: ITab) => void
// //   onCheckedChange: (tab: ITab, state: boolean) => void
// // }>({
// //   value: undefined,
// //   onValueChange: () => {},
// //   onCheckedChange: () => {},
// // })

// export const EMPTY_GENESETS: IGenesetState = {
//   genesets: {},
//   order: [],
// }

// export const genesetsAtom = persistentAtom<IGenesetState>(
//   KEY,
//   {
//     ...EMPTY_GENESETS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// export function useGenesets(): {
//   genesetState: IGenesetState
//   genesetDispatch: Dispatch<GeneSetAction>
// } {
//   const genesetState = useStore(genesetsAtom)

//   const [genesets, genesetDispatch] = useReducer(genesetsReducer, genesetState)

//   useEffect(() => {
//     genesetsAtom.set(genesets)
//   }, [genesets])

//   return { genesetState, genesetDispatch }
// }
