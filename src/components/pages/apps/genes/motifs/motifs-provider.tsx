import { type IChildrenProps } from '@interfaces/children-props'
import { API_MOTIF_DATASETS_URL, API_MOTIF_SEARCH_URL } from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import { produce } from 'immer'
import {
  createContext,
  useEffect,
  useReducer,
  useState,
  type Dispatch,
} from 'react'
import { useMotifSettings } from './motifs-settings'

const MAX_MOTIFS = 10

export interface IMotif {
  publicId: string
  dataset: string
  motifId: string
  motifName: string
  weights: [number, number, number, number][]
}

export type IMotifsAction =
  | {
      type: 'set'
      motifs: IMotif[]
    }
  | {
      type: 'order'
      order: string[]
    }
  | {
      type: 'remove'
      ids: string[]
    }

interface IMotifState {
  motifs: Map<string, IMotif>
  order: string[]
}

export function motifReducer(
  state: IMotifState,
  action: IMotifsAction
): IMotifState {
  //console.log(action, "history")

  switch (action.type) {
    case 'set':
      return {
        motifs: new Map<string, IMotif>(
          action.motifs.map(motif => [motif.publicId, motif])
        ),
        order: action.motifs.map(motif => motif.publicId),
      }
    case 'order':
      return { ...state, order: action.order }
    case 'remove':
      const ids = new Set<string>(action.ids)
      return {
        ...state,
        motifs: new Map<string, IMotif>(
          [...state.motifs.entries()].filter(e => !ids.has(e[0]!))
        ),
        order: state.order.filter(id => !ids.has(id)),
      }
    default:
      return state
  }
}

export function useMotifState(): {
  state: IMotifState
  dispatch: Dispatch<IMotifsAction>
} {
  const [state, dispatch] = useReducer(motifReducer, {
    motifs: new Map<string, IMotif>(),
    order: [],
  })

  return { state, dispatch }
}

export interface IMotifSearch {
  search: string
  reverse: boolean
  complement: boolean
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const MotifsContext = createContext<
  | {
      search: IMotifSearch
      setSearch: (search: IMotifSearch) => void
      datasets: string[]
      datasetsInUse: Map<string, boolean>
      setDatasetsInUse: (datasets: Map<string, boolean>) => void
      state: IMotifState
      dispatch: Dispatch<IMotifsAction>
    }
  | undefined
>(undefined)

// export const MotifsDBContext = createContext<TrieNode<number> | undefined>(
//   undefined,
// )

// export const MotifSearchContext = createContext<string | undefined>(undefined)
// export const MotifUpdateSearchContext = createContext<
//   Dispatch<SetStateAction<string>> | undefined
// >(undefined)

// export const MotifSearchIdsContext = createContext<IMotifState | undefined>(
//   undefined,
// )

// export const MotifSearchIdsDispatchContext = createContext<
//   Dispatch<IMotifsAction> | undefined
// >(undefined)

// export const OrderedMotifSearchIdsContext = createContext<
//   IMotifState | undefined
// >(undefined)

// export const OrderedMotifSearchIdsDispatchContext = createContext<
//   Dispatch<IMotifsAction> | undefined
// >(undefined)

export function MotifsProvider({ children }: IChildrenProps) {
  const queryClient = useQueryClient()

  const { settings, updateSettings } = useMotifSettings()

  const [search, setSearch] = useState<IMotifSearch>({
    search: 'BCL6',
    reverse: settings.revComp,
    complement: settings.revComp,
  })

  const [datasets, setDatasets] = useState<string[]>([])

  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>(settings.datasets.selected.map(d => [d, true]))
  )

  const { state, dispatch } = useMotifState()

  const datasetsQuery = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      console.log(API_MOTIF_DATASETS_URL)
      const res = await httpFetch.getJson<{ data: string[] }>(
        API_MOTIF_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetsQuery.data) {
      setDatasets(datasetsQuery.data)
    }
  }, [datasetsQuery.data])

  //const [orderedMotifSearchIds, orderedMotifSearchIdsDispatch] =
  // useMotifSearchIds()

  useEffect(() => {
    async function query() {
      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['motifs'],
          queryFn: () => {
            return httpFetch.postJson<{ data: { motifs: IMotif[] } }>(
              API_MOTIF_SEARCH_URL,
              {
                body: {
                  search: search.search,
                  reverse: search.reverse,
                  complement: search.complement,
                },
              }
            )
          },
        })

        //console.log('search', res.data)

        let motifs: IMotif[] = res.data.motifs

        motifs = motifs.filter(motif => datasetUseMap.get(motif.dataset)!)

        motifs = motifs.slice(0, MAX_MOTIFS)

        dispatch({ type: 'set', motifs })
      } catch (error) {
        // toast({
        //   type: "set",
        //   alert: makeErrorAlert({
        //     title: "Motifs",
        //     size: "dialog",
        //     message: "No motifs found.",
        //   }),
        // })

        console.log(error)
      }
    }

    if (search.search !== '') {
      query()
    }
  }, [search, datasetUseMap])

  function _setDatasetInUse(datasets: Map<string, boolean>) {
    setDatasetUseMap(datasets)

    updateSettings(
      produce(settings, draft => {
        draft.datasets.selected = [...datasets.entries()]
          .filter(([_, v]) => v)
          .map(([k, _]) => k)
      })
    )
  }

  // useEffect(() => {
  //   const rpn = toRPN(search)

  //   //console.log(rpn)

  //   const stack: number[][] = []
  //   let idset: Set<number>
  //   let ids1: number[]
  //   let ids2: number[]

  //   for (let n of rpn) {
  //     switch (n.op) {
  //       case "AND":
  //         if (stack.length > 1) {
  //           idset = new Set(stack.pop()!)
  //           ids2 = stack.pop()!
  //           stack.push(ids2.filter(id => idset.has(id)))
  //         }
  //         break
  //       case "OR":
  //         if (stack.length > 1) {
  //           ids1 = stack.pop()!
  //           idset = new Set(ids1)
  //           ids2 = stack.pop()!
  //           stack.push(ids1.concat(ids2.filter(id => !idset.has(id))))
  //         }
  //         break
  //       default:
  //         if (n.v) {
  //           stack.push(motifDB.find(n.v)) //search))
  //         }
  //         break
  //     }
  //   }

  //   if (stack.length > 0) {
  //     const ids = stack.pop()! //motifDB.find(search)
  //     // limit search results for rendering purposes
  //     motifSearchIdsDispatch({ type: "set", ids: ids.slice(0, 20) })
  //   }
  //   //orderedMotifSearchIdsDispatch({ type: "add", ids: ids.slice(0, 20) })
  // }, [motifDB, search])

  return (
    <MotifsContext.Provider
      value={{
        search,
        setSearch,
        datasets,
        datasetsInUse: datasetUseMap,
        setDatasetsInUse: _setDatasetInUse,
        state,
        dispatch,
      }}
    >
      {children}
    </MotifsContext.Provider>
  )
}
