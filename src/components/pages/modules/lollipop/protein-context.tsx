import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'

export interface IProtein {
  gene: string
  name: string
  accession: string
  seq: string
  sample: string
  organism: string
  taxonId: number
}

export const DEFAULT_PROTEIN: IProtein = {
  gene: '',
  name: '',
  accession: '',
  seq: '',
  sample: '',
  organism: '',
  taxonId: -1,
}

export type ProteinAction =
  | {
      type: 'set'
      search: { text: string; results: IProtein[] }
      index?: number
    }
  | {
      type: 'update'

      protein: IProtein
    }
  | { type: 'clear' }
  | {
      type: 'selected'
      index: number
    }
interface IProteinState {
  search: { text: string; results: IProtein[] }
  protein: IProtein
}

const DEFAULT_PROPS: IProteinState = {
  protein: { ...DEFAULT_PROTEIN },
  search: { text: '', results: [] },
}

export function proteinReducer(
  state: IProteinState,
  action: ProteinAction
): IProteinState {
  switch (action.type) {
    case 'set':
      return {
        ...state,
        search: { ...action.search },
        protein: action.search.results[action.index ?? 0]!,
      }

    case 'selected':
      return {
        ...state,
        protein: state.search.results[action.index]!,
      }
    case 'update':
      return {
        ...state,
        protein: { ...action.protein },
      }

    case 'clear':
      return { ...DEFAULT_PROPS }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const ProteinContext = createContext<
  [IProteinState, Dispatch<ProteinAction>]
>([{ ...DEFAULT_PROPS }, () => {}])

export function ProteinProvider({ children }: IChildrenProps) {
  const [state, proteinDispatch] = useReducer(proteinReducer, {
    ...DEFAULT_PROPS,
  })

  return (
    <ProteinContext.Provider value={[state, proteinDispatch]}>
      {children}
    </ProteinContext.Provider>
  )
}

//%20AND%20(organism_id:9606)
export async function searchProteins(
  gene: string,
  max: number = 5
): Promise<IProtein[]> {
  const queryClient = useQueryClient()

  let res = await queryClient.fetchQuery({
    queryKey: ['query'],
    queryFn: () =>
      axios.get(
        `https://rest.uniprot.org/uniprotkb/search?query=(gene:${gene})%20AND%20(reviewed:true)&format=json&size=${max}&fields=accession,gene_primary,protein_name,organism_name`
      ),
  })

  console.log(res.data)

  const ret: IProtein[] = await Promise.all(
    res.data.results.map(async (p: unknown) => {
      //console.log(p)

      //const gene = data.genes[0].geneName.value
      const accession = p.primaryAccession
      const name = p.proteinDescription.recommendedName.fullName.value

      const organism = p.organism.commonName
      const taxonId = p.organism.taxonId

      //console.log(gene, accession, name)

      // now get the sequence

      res = await queryClient.fetchQuery({
        queryKey: ['entry'],
        queryFn: () =>
          axios.get(`https://rest.uniprot.org/uniprotkb/${accession}.json`),
      })

      return {
        gene,
        name,
        accession,
        organism,
        taxonId,
        seq: res.data.sequence.value,
        length: res.data.sequence.length,
      }
    })
  )

  return ret.sort((a, b) => a.organism.localeCompare(b.organism))
}
