import { config } from '@/config'
import { httpFetch } from '@/lib/http/http-fetch'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { type IProtein } from './lollipop-utils'
import { checkAA } from './variants'

const MAX_RESULTS = 5
const MAX_CACHE_SIZE = 100 // Maximum number of proteins to cache
const KEY_NAME = `${config.appId}:app:lollipop:proteins:v6`

interface IUniprotResp {
  results: {
    genes: {
      geneName: { value: string }
      geneSymbol: { value: string }
    }[]
    primaryAccession: string
    proteinDescription: {
      recommendedName: { fullName: { value: string } }
    }
    organism: { commonName: string; taxonId: number }
  }[]
  sequence: { value: string; length: number }
}

interface IProteinStore {
  query: string
  proteins: IProtein[]
  addProtein: (protein: IProtein) => void
  removeProtein: (id: string) => void
  //search: (query: string) => IProtein[]
  searchUniprot: (query: string) => Promise<IProtein[]>
  clear: () => void
  getProtein: (id: string) => IProtein | undefined
}

export const useProteinStore = create<IProteinStore>()(
  persist(
    (set, get) => ({
      query: '',
      proteins: [],
      addProtein: (protein: IProtein) =>
        set(state => ({
          proteins: [...state.proteins, protein],
        })),

      // search: (query: string) => {
      //   const queryLower = query.toLowerCase()

      //   const existing = get().proteins.filter(
      //     p =>
      //       p.geneSymbol.toLowerCase().includes(queryLower) ||
      //       p.name.toLowerCase().includes(queryLower) ||
      //       p.accession.toLowerCase().includes(queryLower)
      //   )

      //   return existing
      // },

      searchUniprot: async (query: string) => {
        const queryLower = query.toLowerCase()

        const existing = get().proteins.filter(
          p =>
            p.geneSymbol.toLowerCase().includes(queryLower) ||
            p.name.toLowerCase().includes(queryLower) ||
            p.accession.toLowerCase().includes(queryLower)
        )

        if (existing.length > 0) {
          //console.log('Found existing proteins:', existing)
          return existing
        }

        // take the first word
        query = query
          .trim()
          .replace(/[Pp]rotein/, '')
          .split(' ')[0]!

        const uniProtQuery = `gene:${query} AND reviewed:true`
        const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(uniProtQuery)}&format=json&size=${MAX_RESULTS}&fields=accession,gene_primary,protein_name,organism_name`

        console.log(url)

        let searchRes = await httpFetch.getJson<IUniprotResp>(url)

        console.log('r', searchRes.results)

        const ret: IProtein[] = []

        for (const p of searchRes.results) {
          //const gene = data.genes[0].geneName.value
          const accession = p.primaryAccession
          const name = p.proteinDescription.recommendedName.fullName.value

          const organism = p.organism.commonName
          const taxonId = p.organism.taxonId

          const officialGeneSymbol =
            p.genes[0]?.geneName.value ?? p.genes[0]?.geneSymbol.value ?? query

          console.log('official', officialGeneSymbol, accession, name)

          // now get the sequence

          const accessionRes = await httpFetch.getJson<{
            sequence: { value: string }
          }>(`https://rest.uniprot.org/uniprotkb/${accession}.json`)

          console.log(accessionRes)

          ret.push({
            geneSymbol: officialGeneSymbol,
            name,
            accession,
            organism,
            taxonId,
            sequence: checkAA(accessionRes.sequence.value),
            //length: res.sequence.length,
          })
        }

        ret.sort((a, b) => a.organism.localeCompare(b.organism))

        // add only those that are not already in the store
        set(state => {
          const proteins = [
            ...state.proteins,
            ...ret.filter(
              p =>
                !state.proteins.some(
                  existing => existing.accession === p.accession
                )
            ),
          ].slice(-MAX_CACHE_SIZE)

          return {
            query,
            proteins,
          }
        })

        return ret
      },

      removeProtein: (id: string) =>
        set(state => ({
          proteins: state.proteins.filter(
            p => p.geneSymbol.toLowerCase() === id.toLowerCase()
          ),
        })),
      clear: () => set({ proteins: [] }),
      getProtein: (id: string) =>
        get().proteins.find(
          p => p.geneSymbol.toLowerCase() === id.toLowerCase()
        ),
    }),
    {
      name: KEY_NAME, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useProteins(): IProteinStore {
  const query = useProteinStore(state => state.query)
  const proteins = useProteinStore(state => state.proteins)
  const addProtein = useProteinStore(state => state.addProtein)
  const removeProtein = useProteinStore(state => state.removeProtein)
  const searchUniprot = useProteinStore(state => state.searchUniprot)
  //const search = useProteinStore(state => state.search)
  const clear = useProteinStore(state => state.clear)
  const getProtein = useProteinStore(state => state.getProtein)

  return {
    query,
    proteins,
    addProtein,
    removeProtein,
    searchUniprot,
    //search,
    clear,
    getProtein,
  }
}
