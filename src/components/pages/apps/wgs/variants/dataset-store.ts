import { TIME_5_MINUTES_MS } from '@/consts'
import type { IDBEntity } from '@/interfaces/db-entity'
import { API_WGS_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'

// export interface IMutationDataset {
//   name: string
//   use: boolean
// }
export interface ISampleMetadata {
  name: string
  value: string
}

export interface IVariantSample extends IDBEntity {
  //metadata: Record<string, string> // ISampleMetadata[]
  coo: string
  lymphgenClass: string
  dataset: string
  //type: string
  //institution: string
  pairedNormalDna: number
}

export interface IVariantDataset {
  //id: number // a uuid to uniquely identify the database
  id: string // a public id for the database
  name: string // a human readable name for the database
  assembly: string // the genome assembly of the mutations
  description: string // a description of the database to give more details
  institution: string // the institution that provided the dataset
  //datasets: IMutationDataset[]
  samples: IVariantSample[]
  variants: number
}

export interface IDatasetStore {
  datasets: IVariantDataset[]
  datasetsInUse: IVariantDataset[]
  datasetMap: Record<string, IVariantDataset>
  datasetUseMap: Record<string, boolean>
  sampleMap: Record<string, IVariantSample>

  setDatasets: (datasets: IVariantDataset[]) => void
  setDatasetsInUse: (datasetUseMap: Record<string, boolean>) => void
}

export const useVariantSettingsStore = create<IDatasetStore>()((set, get) => ({
  datasets: [],
  datasetsInUse: [],
  datasetMap: {},
  datasetUseMap: {},
  sampleMap: {},
  variants: null,
  dna: null,
  setDatasets: (datasets: IVariantDataset[]) => {
    const datasetMap = Object.fromEntries(
      datasets.map(dataset => [dataset.id, dataset])
    )

    const sampleMap = Object.fromEntries(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.id, sample] as [string, IVariantSample]
          )
        )
        .flat()
    )

    const datasetUseMap = Object.fromEntries(
      datasets.map(dataset => [dataset.id, true])
    )

    set({
      datasets,
      datasetsInUse: datasets,
      datasetMap,
      sampleMap,
      datasetUseMap,
    })
  },
  setDatasetsInUse: (datasetUseMap: Record<string, boolean>) => {
    const datasetsInUse = get().datasets.filter(
      dataset => datasetUseMap[dataset.id] ?? false
    )
    set({ datasetsInUse, datasetUseMap })
  },
}))

export function useDatasets(): Omit<IDatasetStore, 'setDatasets'> {
  const { fetchAccessToken } = useEdbAuth()
  const { settings } = useEdbSettings()

  const datasets = useVariantSettingsStore(state => state.datasets)
  const datasetsInUse = useVariantSettingsStore(state => state.datasetsInUse)
  const datasetMap = useVariantSettingsStore(state => state.datasetMap)
  const datasetUseMap = useVariantSettingsStore(state => state.datasetUseMap)
  const sampleMap = useVariantSettingsStore(state => state.sampleMap)

  const setDatasets = useVariantSettingsStore(state => state.setDatasets)
  const setDatasetsInUse = useVariantSettingsStore(
    state => state.setDatasetsInUse
  )

  const { data: datasetData } = useQuery({
    queryKey: ['datasets', settings.genomic.assembly],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.getJson<{ data: IVariantDataset[] }>(
        `${API_WGS_URL}/assemblies/${settings.genomic.assembly}/datasets`,
        { headers: bearerHeaders(accessToken) }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (datasetData) {
      setDatasets(datasetData)
    }
  }, [datasetData])

  return {
    datasets,
    datasetsInUse,
    datasetUseMap,
    datasetMap,
    sampleMap,

    setDatasetsInUse,
  }
}
