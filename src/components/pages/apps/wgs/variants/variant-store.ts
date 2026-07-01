import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { API_WGS_URL } from '@/components/edb/edb'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { TIME_5_MINUTES_MS } from '@/consts'
import { useDNAQuery, type IDNA } from '@/lib/genomic/dna'
import { locStr } from '@/lib/genomic/genomic'
import type { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import { useDatasets, type IVariantDataset } from './dataset-store'
import { useVariantSettings } from './variant-settings-store'

export interface IVariant extends IGenomicLocation {
  datasets: string[]
  ref: string
  tum: string
  gene: string
  transcript: string
  tRefCount: number
  tAltCount: number
  tDepth: number
  type: string
  hgvsP?: string
  hgvsC?: string
  exon: number
  exons: number
  consequence?: string
  vaf: number
  sample: string
  y: number
}

export interface IVariantResults {
  location: IGenomicLocation
  datasets: string[]
  variants: IVariant[]
}

export function makeAssemblyMutationMap(
  datasets: IVariantDataset[]
): Map<string, IVariantDataset[]> {
  const ret = new Map<string, IVariantDataset[]>()

  datasets.forEach((dataset) => {
    if (!ret.has(dataset.assembly)) {
      ret.set(dataset.assembly, [])
    }

    ret.get(dataset.assembly)?.push(dataset)
  })

  return ret
}

export interface IVariantStore {
  variants: IVariantResults | null
  dna: IDNA | null
  setVariants: (variants: IVariantResults) => void
  setDNA: (dna: IDNA) => void
}

export const useVariantsStore = create<IVariantStore>()((set) => ({
  variants: null,
  dna: null,
  setVariants: (variants: IVariantResults) => set({ variants }),
  setDNA: (dna: IDNA) => set({ dna }),
}))

export function useVariants(): Omit<IVariantStore, 'setVariants' | 'setDNA'> {
  const { fetchAccessToken } = useEdbAuth()
  const { settings: edbSettings } = useEdbSettings()
  const { settings } = useVariantSettings()
  const { datasetsInUse } = useDatasets()

  const dna = useVariantsStore((state) => state.dna)
  const variants = useVariantsStore((state) => state.variants)

  const setDNA = useVariantsStore((state) => state.setDNA)
  const setVariants = useVariantsStore((state) => state.setVariants)

  const { data: variantData } = useQuery({
    queryKey: [
      'variants',
      locStr(settings.location),
      datasetsInUse.map((d) => d.id).join(','),
      edbSettings.genomic.assembly,
    ],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      const res = await httpFetch.postJson<{ data: IVariantResults }>(
        `${API_WGS_URL}/assemblies/${edbSettings.genomic.assembly}/variants`,
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
    if (variantData) {
      setVariants(variantData)
    }
  }, [variantData])

  // auto get dna when region changes
  const { data: dnaData } = useDNAQuery(settings.location, {
    format: 'upper',
    assembly: 'hg19',
  })

  useEffect(() => {
    if (dnaData) {
      setDNA(dnaData)
    }
  }, [dnaData])

  return {
    dna,
    variants,
  }
}
