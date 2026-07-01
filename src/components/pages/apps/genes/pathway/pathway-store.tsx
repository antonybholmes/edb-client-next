import { httpFetch } from '@/lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'

import { useEffect } from 'react'
import { create } from 'zustand'

import { API_PATHWAY_DATASETS_URL } from '@/components/edb/edb'
import { TIME_5_MINUTES_MS } from '@/consts'
import type { IDBEntity } from '@/interfaces/db-entity'
import { GENES_IN_UNIVERSE } from '@/lib/gene/pathway/pathway'

export interface ICollectionInfo extends IDBEntity {
  genesets: number
}

export interface IDatsetInfo extends IDBEntity {
  collections: ICollectionInfo[]
}

export interface IPathwayStore {
  datasets: IDatsetInfo[]
  collectionsInUse: Record<string, boolean>

  genesInUniverse: number
  setDatasets: (datasets: IDatsetInfo[]) => void
  setCollectionsInUse: (collectionsInUse: Record<string, boolean>) => void
  setSelectAllCollections: (selectAll: boolean) => void
  setGenesInUniverse: (genesInUniverse: number) => void
}

// Used to store local collections of genesets that are not in the database
export const LOCAL_DATASET: IDatsetInfo = {
  id: '019e6b18-c3e2-7e24-ab08-f7a34991eaef',
  name: 'Local',
  collections: [],
}

export const usePathwayStore = create<IPathwayStore>()((set) => ({
  datasets: [{ ...LOCAL_DATASET }],
  collectionsInUse: {},

  genesInUniverse: GENES_IN_UNIVERSE,
  setDatasets: (datasets: IDatsetInfo[]) =>
    set((state) => ({ ...state, datasets: [state.datasets[0]!, ...datasets] })),
  setCollectionsInUse: (collectionsInUse: Record<string, boolean>) =>
    set({ collectionsInUse }),
  setSelectAllCollections: (selectAll: boolean) => {
    set((state) => ({
      collectionsInUse: Object.fromEntries(
        state.datasets
          .map((dataset) => dataset.collections)
          .flat()
          .map((ds) => [ds.id, selectAll])
      ),
    }))
  },
  setGenesInUniverse: (genesInUniverse: number) => set({ genesInUniverse }),
}))

export function usePathways(opts: { selectAll?: boolean } = {}): IPathwayStore {
  const { selectAll = true } = opts

  const datasets = usePathwayStore((state) => state.datasets)
  const collectionsInUse = usePathwayStore((state) => state.collectionsInUse)

  const genesInUniverse = usePathwayStore((state) => state.genesInUniverse)

  const setDatasets = usePathwayStore((state) => state.setDatasets)
  const setCollectionsInUse = usePathwayStore(
    (state) => state.setCollectionsInUse
  )
  const setSelectAllCollections = usePathwayStore(
    (state) => state.setSelectAllCollections
  )
  const setGenesInUniverse = usePathwayStore(
    (state) => state.setGenesInUniverse
  )

  const { data: datasetsDb } = useQuery({
    queryKey: ['datasets'],
    staleTime: TIME_5_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IDatsetInfo[] }>(
        API_PATHWAY_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetsDb) {
      setDatasets(datasetsDb)
      setCollectionsInUse(
        Object.fromEntries(
          datasetsDb
            .map((dataset) => dataset.collections)
            .flat()
            .map((ds) => [ds.id, selectAll])
        )
      )
    }
  }, [datasetsDb])

  return {
    datasets,
    collectionsInUse,
    genesInUniverse,
    setDatasets,
    setCollectionsInUse,
    setSelectAllCollections,
    setGenesInUniverse,
  }
}

// export function makeDatasetId(dataset: ICollectionInfo) {
//   return `${dataset.organization}:${dataset.name}`
// }
