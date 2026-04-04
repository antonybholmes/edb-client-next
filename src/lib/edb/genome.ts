import { useQuery } from '@tanstack/react-query'
import type { Feature, IGenomicFeature } from '../genomic/genomic'
import { httpFetch } from '../http/http-fetch'
import { EDB_API_URL } from './edb'

export const API_GENOME_URL = `${EDB_API_URL}/modules/genome`
export const API_GENOME_GTFS_URL = `${API_GENOME_URL}/gtfs`
//export const API_GENOME_OVERLAP_URL = `${API_GENOME_URL}/overlap`
//export const API_GENOME_INFO_URL = `${API_GENOME_URL}/info`

import { useEffect } from 'react'
import { useSeqBrowserSettings } from '../../components/pages/apps/genomic/seq-browser/seq-browser-settings'

import { create } from 'zustand'

export interface IGenomeAnnotation {
  id: string
  genome: string
  assembly: string
  name: string
}

export type GtfInfoMap = Record<string, IGenomeAnnotation>

export interface IGenomeStore {
  gtfMap: GtfInfoMap
  gtf: IGenomeAnnotation | null

  setGtfMap: (gtfMap: GtfInfoMap) => void
  setGtf: (gtf: IGenomeAnnotation) => void
}

export const useGenomesStore = create<IGenomeStore>()(set => ({
  gtfMap: {},
  gtf: null,

  setGtfMap: gtfMap => {
    set({ gtfMap })
  },
  setGtf: (gtf: IGenomeAnnotation) => {
    set({ gtf })
  },
}))

export function useGenomes() {
  const { settings } = useSeqBrowserSettings()
  const gtfMap = useGenomesStore(state => state.gtfMap)
  const gtf = useGenomesStore(state => state.gtf)
  const setGtfMap = useGenomesStore(state => state.setGtfMap)
  const setGtf = useGenomesStore(state => state.setGtf)

  // get the available GTF annotations available
  const gtfQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGenomeAnnotation[] }>(
        API_GENOME_GTFS_URL
      )

      return res.data
    },
  })

  useEffect(() => {
    if (gtfQuery.data) {
      const gtfMap: GtfInfoMap = Object.fromEntries(
        gtfQuery.data.map(
          (g: IGenomeAnnotation) =>
            [g.assembly.toLowerCase(), g] as [string, IGenomeAnnotation]
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

      //console.log('GTF Map:', gtfMap)

      setGtfMap(gtfMap)
    }
  }, [gtfQuery.data])

  useEffect(() => {
    if (gtfMap) {
      const gtf = gtfMap[settings.assembly.toLowerCase()]

      if (gtf) {
        setGtf(gtf)
      }
    }
  }, [settings.assembly, gtfMap])

  return {
    gtf,
    gtfMap,
  }
}

export function useGeneQuery(
  query: string,
  assembly: string,
  feature: Feature = 'gene'
) {
  const { gtf } = useGenomes()

  return useQuery({
    queryKey: ['gene-search', gtf?.id, assembly, query],
    queryFn: async () => {
      if (!gtf || query.length < 2 || query.startsWith('chr')) {
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
          `${API_GENOME_URL}/gtfs/${gtf.id}/search?q=${query}&feature=${feature}` //&mode=fuzzy`
        )

        console.log('gene search result', res.data)

        return res.data
      } catch (e) {
        console.error('gene search error', e)
        throw e
      }
    },
  })
}
