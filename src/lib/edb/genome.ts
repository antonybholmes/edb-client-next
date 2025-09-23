import { useQuery } from '@tanstack/react-query'
import { Feature, IGenomicFeature } from '../genomic/genomic'
import { httpFetch } from '../http/http-fetch'
import { EDB_API_URL } from './edb'

export const API_GENOME_URL = `${EDB_API_URL}/modules/genome`
export const API_GENOME_GENOMES_URL = `${API_GENOME_URL}/genomes`
export const API_GENOME_OVERLAP_URL = `${API_GENOME_URL}/overlap`
export const API_GENOME_INFO_URL = `${API_GENOME_URL}/info`

export function useGeneQuery(
  query: string,
  genome: string,
  feature: Feature = 'gene'
) {
  return useQuery({
    queryKey: ['gene-search', genome, query],
    queryFn: async () => {
      if (query.length < 2 || query.includes('chr:')) {
        return []
      }

      console.log(
        'search genes',
        genome,
        query,
        feature,
        `${API_GENOME_INFO_URL}/${genome}?search=${query}&feature=${feature}&mode=fuzzy`
      )

      try {
        const res = await httpFetch.getJson<{
          data: IGenomicFeature[]
        }>(
          `${API_GENOME_INFO_URL}/${genome}?search=${query}&feature=${feature}&mode=fuzzy`
        )

        console.log('search genes', res.data)

        return res.data
      } catch (e) {
        console.error('gene search error', e)
        throw e
        //
        //return []
      }
    },
  })
}
