import { useQuery } from '@tanstack/react-query'

import { httpFetch } from '../http/http-fetch'
import { EDB_API_URL } from './edb'

export const API_GENOME_URL = `${EDB_API_URL}/modules/genome`
export const API_GENOME_GTFS_URL = `${API_GENOME_URL}/gtfs`
//export const API_GENOME_OVERLAP_URL = `${API_GENOME_URL}/overlap`
//export const API_GENOME_INFO_URL = `${API_GENOME_URL}/info`

import { useEffect } from 'react'

import { create } from 'zustand'
import { TIME_5_MINUTES_MS } from '../../consts'

import type { Feature, IGenomicFeature } from '../genomic/genomic-feature'
import { useEdbSettings } from './edb-settings'

export interface IGTFInfo {
  id: string
  genome: string
  assembly: string
  name: string
}

export type GtfInfoMap = Record<string, IGTFInfo>

export const DEFAULT_ASSEMBLIES = [
  { value: 'grch37', label: 'GRCh37/hg19' },
  { value: 'grch38', label: 'GRCh38/hg38' },
  { value: 'grcm38', label: 'GRCm38/mm10' },
  //{ value: 'grcm39', label: 'GRCm39/mm39' },
]

/**
 * Standardize genome assembly names to a common format. This is useful for mapping user input or different data sources to the correct GTF annotations.
 * @param name
 * @returns
 */
export function normalizeAssemblyName(name: string): string {
  return name
    .toLowerCase()
    .replace('hg19', 'grch37')
    .replace('hg38', 'grch38')
    .replace('mm10', 'grcm38')
    .replace('mm39', 'grcm39')
}

export interface IGenomeStore {
  gtfs: IGTFInfo[]
  gtfMap: GtfInfoMap
  gtf: IGTFInfo | null

  setGtfs: (gtfs: IGTFInfo[], gtfMap: GtfInfoMap) => void
  setGtf: (gtf: IGTFInfo) => void
}

export const useGenomesStore = create<IGenomeStore>()((set) => ({
  gtfs: [],
  gtfMap: {},
  gtf: null,

  setGtfs: (gtfs, gtfMap) => {
    set({ gtfs, gtfMap })
  },

  setGtf: (gtf: IGTFInfo) => {
    set({ gtf })
  },
}))

export function useGenomes() {
  const { settings } = useEdbSettings()
  const gtfMap = useGenomesStore((state) => state.gtfMap)
  const gtfs = useGenomesStore((state) => state.gtfs)
  const gtf = useGenomesStore((state) => state.gtf)
  const setGtfs = useGenomesStore((state) => state.setGtfs)
  const setGtf = useGenomesStore((state) => state.setGtf)

  // get the available GTF annotations available
  const gtfQuery = useQuery({
    queryKey: ['genomes'],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGTFInfo[] }>(
        API_GENOME_GTFS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (!gtfQuery.data) {
      return
    }

    const gtfMap: GtfInfoMap = Object.fromEntries(
      gtfQuery.data.map(
        (g: IGTFInfo) => [g.assembly.toLowerCase(), g] as [string, IGTFInfo]
      )
    )

    if ('grch37' in gtfMap) {
      gtfMap['hg19'] = gtfMap['grch37']
    }

    if ('grch38' in gtfMap) {
      gtfMap['hg38'] = gtfMap['grch38']
    }

    if ('grcm38' in gtfMap) {
      gtfMap['mm10'] = gtfMap['grcm38']
    }

    if ('grcm39' in gtfMap) {
      gtfMap['mm39'] = gtfMap['grcm39']
    }

    setGtfs(gtfQuery.data, gtfMap)
  }, [gtfQuery.data])

  useEffect(() => {
    if (gtfMap) {
      const gtf = gtfMap[settings.genomic.assembly.toLowerCase()]

      if (gtf) {
        setGtf(gtf)
      }
    }
  }, [settings.genomic.assembly, gtfMap])

  return {
    gtf,
    gtfs,
    gtfMap,
  }
}

export function useGeneQuery(
  query: string,
  assembly: string,
  feature: Feature = 'gene'
) {
  //const { gtf } = useGenomes()

  return useQuery({
    queryKey: ['gene-search', assembly, query],
    queryFn: async () => {
      if (query.length < 2 || query.startsWith('chr')) {
        return []
      }

      try {
        // const res = await httpFetch.getJson<{
        //   data: IGenomicFeature[]
        // }>(
        //   `${API_GENOME_URL}/assemblies/${assembly}/search?q=${query}&feature=${feature}&mode=fuzzy`
        // )

        const res = await httpFetch.getJson<{
          data: IGenomicFeature[]
        }>(
          `${API_GENOME_GTFS_URL}/${assembly}/search?q=${query}&feature=${feature}` //&mode=fuzzy`
        )

        return res.data
      } catch (e) {
        console.error('gene search error', e)
        throw e
      }
    },
  })
}
