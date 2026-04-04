import { API_MOTIF_DATASETS_URL, API_MOTIF_SEARCH_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { useQuery } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

import { config } from '@/config'
import { getModuleName } from '@/lib/module-info'

import { useEffect } from 'react'
import { create } from 'zustand'

import { DEFAULT_DEBOUNCE_DELAY_MS, useDebounce } from '@/hooks/debounce'
import type { IDBEntity } from '@/interfaces/db-entity'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useMotifSettings } from './motifs-settings'

//const MAX_MOTIFS = 100

const SETTINGS_KEY = `${config.appId}:app:${getModuleName(MODULE_INFO.name)}:store:v4`

export interface IPaging {
  page: number
  pageSize: number
}

export interface IMotifSearch {
  query: string
  paging: IPaging
  mode: 'basic' | 'advanced' // advanced = boolean logic
}
export interface IDataset extends IDBEntity {
  motifCount: number
}

export interface IMotif extends IDBEntity {
  dataset: IDBEntity
  motifId: string
  weights: [number, number, number, number][]
}

export interface IMotifSearchResult {
  motifs: IMotif[]
  total: number
  paging: IPaging
}

export interface IMotifStore {
  search: IMotifSearch
  updateSearch: (search: IMotifSearch) => void
  datasets: IDataset[]
  datasetsInUse: Record<string, boolean>
  datasetMap: Record<string, IDataset>
  setDatasets: (datasets: IDataset[]) => void
  setDatasetsInUse: (datasetsInUse: Record<string, boolean>) => void
  setDatasetMap: (datasetMap: Record<string, IDataset>) => void
  searchResult: IMotifSearchResult
  motifsInUse: Record<string, boolean>
  setSearchResult: (searchResult: IMotifSearchResult) => void
  setMotifsInUse: (motifsInUse: Record<string, boolean>) => void
}

export const useMotifStore = create<IMotifStore>()(
  persist(
    set => ({
      searchResult: { motifs: [], total: 0, paging: { page: 1, pageSize: 10 } },
      motifsInUse: {},
      search: {
        query: 'BCL6',
        paging: { page: 1, pageSize: 10 },

        mode: 'basic',
      },
      datasets: [],
      datasetsInUse: {},
      datasetMap: {},
      updateSearch: (search: IMotifSearch) => set({ search }),
      setDatasets: (datasets: IDataset[]) => set({ datasets }),
      setDatasetsInUse: (datasetsInUse: Record<string, boolean>) =>
        set({ datasetsInUse }),
      setDatasetMap: (datasetMap: Record<string, IDataset>) =>
        set({ datasetMap }),
      //setSearch: (search: IMotifSearch) => set({ search }),
      setSearchResult: (searchResult: IMotifSearchResult) =>
        set({ searchResult }),
      setMotifsInUse: (motifsInUse: Record<string, boolean>) =>
        set({ motifsInUse }),
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useMotifs(): Omit<IMotifStore, 'setDatasetMap'> {
  const { settings } = useMotifSettings()

  const search = useMotifStore(state => state.search)
  const updateSearch = useMotifStore(state => state.updateSearch)
  const searchResult = useMotifStore(state => state.searchResult)
  const motifsInUse = useMotifStore(state => state.motifsInUse)
  //const search = useMotifStore(state => state.search)
  //const setSearch = useMotifStore(state => state.setSearch)
  const datasets = useMotifStore(state => state.datasets)
  const datasetMap = useMotifStore(state => state.datasetMap)
  const datasetsInUse = useMotifStore(state => state.datasetsInUse)
  const setDatasets = useMotifStore(state => state.setDatasets)
  const setDatasetMap = useMotifStore(state => state.setDatasetMap)
  const setDatasetsInUse = useMotifStore(state => state.setDatasetsInUse)
  const setSearchResult = useMotifStore(state => state.setSearchResult)
  const setMotifsInUse = useMotifStore(state => state.setMotifsInUse)

  // reduce the number of searches sent to server by debouncing the search query
  const debouncedQuery = useDebounce(search.query, {
    delayMs: DEFAULT_DEBOUNCE_DELAY_MS,
  })

  // If user is toggling datasets quickly, debounce that too
  const debouncedDatasetsInUse = useDebounce(datasetsInUse, {
    delayMs: DEFAULT_DEBOUNCE_DELAY_MS,
  })

  const datasetInUseKey = JSON.stringify(debouncedDatasetsInUse)

  const { data: datasetData, isSuccess: isDatasetSuccess } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      console.log(API_MOTIF_DATASETS_URL)
      const res = await httpFetch.getJson<{ data: IDataset[] }>(
        API_MOTIF_DATASETS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (!isDatasetSuccess || !datasetData) {
      return
    }

    setDatasets(datasetData)
    setDatasetMap(Object.fromEntries(datasetData.map(d => [d.id, d])))
    const newDatasetsInUse = Object.fromEntries(
      datasetData.map(d => [d.id, datasetsInUse[d.id] ?? true])
    )

    setDatasetsInUse(newDatasetsInUse)
  }, [isDatasetSuccess, datasetData])

  const { data: searchData, isSuccess: isSearchSuccess } = useQuery({
    queryKey: [
      'motifs',
      debouncedQuery,
      search.paging.page,
      search.paging.pageSize,
      search.mode,
      datasetInUseKey,
    ],
    queryFn: async () => {
      console.log(API_MOTIF_DATASETS_URL)

      let queryParam: string = debouncedQuery.trim()

      if (search.mode === 'basic') {
        // split on commas or whitespace or newlines or pipes
        const queries = debouncedQuery
          .split(/[\s,|\n]+/)
          .filter(q => q.length > 0)
          .map(q => q.trim())

        console.log('basic queries', queries)

        // q accepts comma separated queries
        queryParam = queries.join(',')
      }

      const datasetIds: string[] = Object.entries(debouncedDatasetsInUse)
        .filter(([_, v]) => v)
        .map(([k, _]) => k)
        .sort()

      const res = await httpFetch.postJson<{ data: IMotifSearchResult }>(
        //`${API_MOTIF_SEARCH_URL}?q=${encodeURIComponent(queryParam)}&page=${settings.search.page}&pageSize=${settings.search.pageSize}&searchMode=${settings.search.mode}`,
        `${API_MOTIF_SEARCH_URL}`,
        {
          body: {
            q: queryParam,
            page: search.paging.page,
            pageSize: search.paging.pageSize,
            searchMode: search.mode,
            datasets: datasetIds,
          },
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (!isSearchSuccess || !searchData) {
      return
    }

    //let motifs: IMotif[] = searchData.motifs

    //motifs = motifs.filter(motif => datasetsInUse[motif.dataset] ?? true)

    // sort

    const sortBy = settings.sort.by + ',' + settings.sort.asc

    console.log('Sorting motifs by ', sortBy)

    switch (settings.sort.by + ',' + (settings.sort.asc ? 'asc' : 'desc')) {
      case 'motif-id,asc':
        searchData.motifs.sort((a, b) => {
          const aid = a.motifId.toLowerCase()
          const bid = b.motifId.toLowerCase()

          const c = aid.localeCompare(bid)
          if (c !== 0) {
            return c
          }

          // name not good enough, sort by dataset
          const ad = a.dataset.name.toLowerCase()
          const bd = b.dataset.name.toLowerCase()

          return ad.localeCompare(bd)
        })
        break
      case 'motif-id,desc':
        searchData.motifs.sort((a, b) => {
          const aid = a.motifId.toLowerCase()
          const bid = b.motifId.toLowerCase()

          const c = bid.localeCompare(aid)
          if (c !== 0) {
            return c
          }

          // name not good enough, sort by dataset
          const ad = a.dataset.name.toLowerCase()
          const bd = b.dataset.name.toLowerCase()

          return bd.localeCompare(ad)
        })
        break
      case 'dataset,motif-id,desc':
        searchData.motifs.sort((a, b) => {
          const ad = a.dataset.name.toLowerCase()
          const bd = b.dataset.name.toLowerCase()

          const c = bd.localeCompare(ad)
          if (c !== 0) {
            return c
          }

          const aid = a.motifId.toLowerCase()
          const bid = b.motifId.toLowerCase()

          return bid.localeCompare(aid)
        })
        break
      default:
        searchData.motifs.sort((a, b) => {
          const ad = a.dataset.name.toLowerCase()
          const bd = b.dataset.name.toLowerCase()

          const c = ad.localeCompare(bd)
          if (c !== 0) {
            return c
          }

          const aid = a.motifId.toLowerCase()
          const bid = b.motifId.toLowerCase()

          return aid.localeCompare(bid)
        })
        break
    }

    //motifs = motifs.slice(0, MAX_MOTIFS)

    setSearchResult(searchData)

    const newMotifsInUse: Record<string, boolean> = Object.fromEntries(
      searchData.motifs.map(motif => [motif.id, motifsInUse[motif.id] ?? true])
    )

    setMotifsInUse(newMotifsInUse)
  }, [
    searchData,
    isSearchSuccess,
    datasetInUseKey,
    settings.sort.by,
    settings.sort.asc,
  ])

  return {
    search,
    searchResult,
    motifsInUse,
    datasets,
    datasetMap,
    datasetsInUse,
    setDatasets,
    updateSearch,
    setSearchResult,
    setMotifsInUse,
    setDatasetsInUse,
  }
}
