import { httpFetch } from '@/lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'

import { useEffect } from 'react'
import { create } from 'zustand'

import { TIME_5_MINUTES_MS } from '@/consts'
import { API_PATHWAY_DATASETS_URL } from '@/lib/edb/edb'
import { GENES_IN_UNIVERSE } from '@/lib/gene/pathway/pathway'

export interface IDatasetInfo {
  organization: string
  name: string
  pathways: number
}

export interface IOrgInfo {
  name: string
  datasets: IDatasetInfo[]
}

export interface IPathwayStore {
  datasets: IOrgInfo[]
  datasetsForUse: Record<string, boolean>
  selectAllDatasets: boolean
  genesInUniverse: number
  setDatasets: (datasets: IOrgInfo[]) => void
  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) => void
  setSelectAllDatasets: (selectAllDatasets: boolean) => void
  setGenesInUniverse: (genesInUniverse: number) => void
}

export const usePathwayStore = create<IPathwayStore>()(set => ({
  datasets: [],
  datasetsForUse: {},
  selectAllDatasets: true,
  genesInUniverse: GENES_IN_UNIVERSE,
  setDatasets: (datasets: IOrgInfo[]) => set({ datasets }),
  setDatasetsForUse: (datasetsForUse: Record<string, boolean>) =>
    set({ datasetsForUse }),
  setSelectAllDatasets: (selectAllDatasets: boolean) =>
    set({ selectAllDatasets }),
  setGenesInUniverse: (genesInUniverse: number) => set({ genesInUniverse }),
}))

export function usePathways(): IPathwayStore {
  const datasets = usePathwayStore(state => state.datasets)
  const datasetsForUse = usePathwayStore(state => state.datasetsForUse)
  const selectAllDatasets = usePathwayStore(state => state.selectAllDatasets)
  const genesInUniverse = usePathwayStore(state => state.genesInUniverse)

  const setDatasets = usePathwayStore(state => state.setDatasets)
  const setDatasetsForUse = usePathwayStore(state => state.setDatasetsForUse)
  const setSelectAllDatasets = usePathwayStore(
    state => state.setSelectAllDatasets
  )
  const setGenesInUniverse = usePathwayStore(state => state.setGenesInUniverse)

  const { data: datasetsData } = useQuery({
    queryKey: ['datasets'],
    staleTime: TIME_5_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IOrgInfo[] }>(
        API_PATHWAY_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetsData) {
      setDatasets(datasetsData)
      setDatasetsForUse(
        Object.fromEntries(
          datasetsData
            .map(org => org.datasets)
            .flat()
            .map(ds => [makeDatasetId(ds), true])
        )
      )
    }
  }, [datasetsData])

  return {
    datasets,
    datasetsForUse,
    selectAllDatasets,
    genesInUniverse,
    setDatasets,
    setDatasetsForUse,
    setSelectAllDatasets,
    setGenesInUniverse,
  }
}

export function makeDatasetId(dataset: IDatasetInfo) {
  return `${dataset.organization}:${dataset.name}`
}
