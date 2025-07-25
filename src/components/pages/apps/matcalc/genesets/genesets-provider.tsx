// import { type IChildrenProps } from '@interfaces/children-props'

// import { createContext, useReducer, type Dispatch } from 'react'
// import {
//   EMPTY_GENESETS,
//   genesetsReducer,
//   type GeneSetAction,
//   type IGenesetState,
// } from './genesets'

// export const GenesetsContext = createContext<{
//   genesetState: IGenesetState
//   genesetDispatch: Dispatch<GeneSetAction>
// }>({ genesetState: { ...EMPTY_GENESETS }, genesetDispatch: () => {} })

// export function GenesetsProvider({ children }: IChildrenProps) {
//   const [genesetState, genesetDispatch] = useReducer(genesetsReducer, {
//     ...EMPTY_GENESETS,
//   })

//   return (
//     <GenesetsContext.Provider value={{ genesetState, genesetDispatch }}>
//       {children}
//     </GenesetsContext.Provider>
//   )
// }
