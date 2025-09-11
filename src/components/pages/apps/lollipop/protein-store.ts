import { APP_ID } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'

import { queryClient } from '@/query'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { toAA } from './amino-acids'
import { type IProtein } from './lollipop-utils'

const MAX_RESULTS = 5
const MAX_CACHE_SIZE = 100 // Maximum number of proteins to cache

interface IProteinStore {
  proteins: IProtein[]
  addProtein: (protein: IProtein) => void
  removeProtein: (id: string) => void
  search: (query: string) => IProtein[]
  searchUniprot: (query: string) => Promise<IProtein[]>
  clear: () => void
  getProtein: (id: string) => IProtein | undefined
}

export const useProteinStore = create<IProteinStore>()(
  persist(
    (set, get) => ({
      proteins: [],
      addProtein: (protein: IProtein) =>
        set((state) => ({
          proteins: [...state.proteins, protein],
        })),

      search: (query: string) => {
        const queryLower = query.toLowerCase()

        const existing = get().proteins.filter(
          (p) =>
            p.gene.toLowerCase().includes(queryLower) ||
            p.name.toLowerCase().includes(queryLower) ||
            p.accession.toLowerCase().includes(queryLower)
        )

        return existing
      },

      searchUniprot: async (query: string) => {
        const queryLower = query.toLowerCase()

        const existing = get().proteins.filter(
          (p) =>
            p.gene.toLowerCase().includes(queryLower) ||
            p.name.toLowerCase().includes(queryLower) ||
            p.accession.toLowerCase().includes(queryLower)
        )

        if (existing.length > 0) {
          //console.log('Found existing proteins:', existing)
          return existing
        }

        query = query.replace(/[Pp]rotein/, '')
        query = query.trim()
        query = query.split(' ')[0]! // take the first word

        query = `gene:${query} AND reviewed:true`
        const url = `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&format=json&size=${MAX_RESULTS}&fields=accession,gene_primary,protein_name,organism_name`

        console.log(url)

        let res = await queryClient.fetchQuery({
          queryKey: ['uniprot', query],
          queryFn: () => {
            // console.log(
            //   'search',
            //   `https://rest.uniprot.org/uniprotkb/search?query=(gene:${gene})%20AND%20(reviewed:true)&format=json&size=${max}&fields=accession,gene_primary,protein_name,organism_name`
            // )
            const res = httpFetch.getJson<{
              results: {
                genes: { geneSymbol: { value: string } }[]
                primaryAccession: string
                proteinDescription: {
                  recommendedName: { fullName: { value: string } }
                }
                organism: { commonName: string; taxonId: number }
              }[]
              sequence: { value: string; length: number }
            }>(url)

            return res
          },
        })

        //console.log('r', res.results)

        const ret: IProtein[] = []

        for (const p of res.results) {
          //const gene = data.genes[0].geneName.value
          const accession = p.primaryAccession
          const name = p.proteinDescription.recommendedName.fullName.value

          const organism = p.organism.commonName
          const taxonId = p.organism.taxonId

          const officialGeneSymbol = p.genes[0]?.geneSymbol.value ?? query

          console.log(officialGeneSymbol, accession, name)

          // now get the sequence

          res = await queryClient.fetchQuery({
            queryKey: ['uniprot-accession', accession],
            queryFn: () =>
              httpFetch.getJson<{ sequence: { value: string } }>(
                `https://rest.uniprot.org/uniprotkb/${accession}.json`
              ),
          })

          console.log(res)

          ret.push({
            gene: officialGeneSymbol,
            name,
            accession,
            organism,
            taxonId,
            sequence: toAA(res.sequence.value),
            //length: res.sequence.length,
          })
        }

        ret.sort((a, b) => a.organism.localeCompare(b.organism))

        // add only those that are not already in the store
        set((state) => ({
          proteins: [
            ...state.proteins,
            ...ret.filter(
              (p) =>
                !state.proteins.some(
                  (existing) => existing.accession === p.accession
                )
            ),
          ].slice(-MAX_CACHE_SIZE),
        }))

        return ret
      },

      removeProtein: (id: string) =>
        set((state) => ({
          proteins: state.proteins.filter(
            (p) => p.gene.toLowerCase() === id.toLowerCase()
          ),
        })),
      clear: () => set({ proteins: [] }),
      getProtein: (id: string) =>
        get().proteins.find((p) => p.gene.toLowerCase() === id.toLowerCase()),
    }),
    {
      name: `${APP_ID}:app:lollipop:proteins:v1`, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useProteins(): IProteinStore {
  const proteins = useProteinStore((state) => state.proteins)
  const addProtein = useProteinStore((state) => state.addProtein)
  const removeProtein = useProteinStore((state) => state.removeProtein)
  const searchUniprot = useProteinStore((state) => state.searchUniprot)
  const search = useProteinStore((state) => state.search)
  const clear = useProteinStore((state) => state.clear)
  const getProtein = useProteinStore((state) => state.getProtein)

  return {
    proteins,
    addProtein,
    removeProtein,
    searchUniprot,
    search,
    clear,
    getProtein,
  }
}
