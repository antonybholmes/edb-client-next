import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { API_WGS_URL } from '@/components/edb/edb'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { TIME_5_MINUTES_MS } from '@/consts'
import { locStr } from '@/lib/genomic/genomic'
import type { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import { useDatasets } from './dataset-store'
import { useVariantSettings } from './variant-settings-store'

export interface IMAF {
  start: number
  index: number
  count: number
}

export interface IMAFResults {
  location: IGenomicLocation
  datasets: string[]
  samples: number
  alleles: number
  mafs: IMAF[]
}

export interface IMAFStore {
  mafs: IMAFResults | null
  setMAFs: (mafs: IMAFResults) => void
}

export const useMAFStore = create<IMAFStore>()((set) => ({
  mafs: null,
  setMAFs: (mafs: IMAFResults) => set({ mafs }),
}))

export function useMAFs(): Omit<IMAFStore, 'setMAFs'> & {
  setSampleCount: (count: number) => void
} {
  const { fetchAccessToken } = useEdbAuth()
  const { settings } = useVariantSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { datasetsInUse } = useDatasets()

  const mafs = useMAFStore((state) => state.mafs)
  const setMAFs = useMAFStore((state) => state.setMAFs)

  const { data: mafData } = useQuery({
    queryKey: [
      'mafs',
      locStr(settings.location),
      datasetsInUse.map((d) => d.id).join(','),
      edbSettings.genomic.assembly,
    ],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.postJson<{ data: IMAFResults }>(
        `${API_WGS_URL}/assemblies/${edbSettings.genomic.assembly}/mafs`,
        {
          body: {
            locations: [locStr(settings.location)],
            datasets: datasetsInUse.map((dataset) => dataset.id),
          },

          headers: bearerHeaders(accessToken),
        }
      )

      return res.data
    },
  })

  useEffect(() => {
    if (mafData) {
      setMAFs(mafData)
    }
  }, [mafData])

  function setSampleCount(count: number) {
    if (!mafData) {
      return
    }

    setMAFs({
      ...mafData,
      samples: count,
      alleles: count * 2,
    })
  }

  return {
    mafs,
    setSampleCount,
  }
}
