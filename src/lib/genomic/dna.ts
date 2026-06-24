import { findCols, type BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { API_DNA_URL } from '@/lib/edb/edb'

import { TIME_5_MINUTES_MS } from '@/consts'

import { QueryClient, useQuery } from '@tanstack/react-query'

import { AnnotationDataFrame } from '../dataframe/annotation-dataframe'
import type { SeriesData } from '../dataframe/series-data'
import { httpFetch } from '../http/http-fetch'
import { GenLoc, locStr } from './genomic'
import type { IGenomicLocation } from './genomic-location'

export type DNABase = 'A' | 'C' | 'G' | 'T' | 'a' | 'c' | 'g' | 't'

export const CHR_INDEX_MAP: { [key: string]: number } = {
  chr1: 1,
  chr2: 2,
  chr3: 3,
  chr4: 4,
  chr5: 5,
  chr6: 6,
  chr7: 7,
  chr8: 8,
  chr9: 9,
  chr10: 10,
  chr11: 11,
  chr12: 12,
  chr13: 13,
  chr14: 14,
  chr15: 15,
  chr16: 16,
  chr17: 17,
  chr18: 18,
  chr19: 19,
  chr20: 20,
  chr21: 21,
  chr22: 22,
  chrX: 23,
  chrY: 24,
  chrM: 25,
  chrMT: 25,
}

interface IDNAResp {
  data: { seqs: { seq: string }[] }
}

/**
 * Format chr so it is in the form 'chrx'.
 *
 * @param chr
 * @returns
 */
export function formatChr(chr: string | number): string {
  chr = chr.toString()

  if (!chr.startsWith('chr')) {
    chr = `chr${chr}`
  }

  return chr
}

export function humanChrToNum(chr: string): number {
  if (chr in CHR_INDEX_MAP) {
    return CHR_INDEX_MAP[chr]!
  }

  return 1000
}

export interface IDNA {
  location: IGenomicLocation
  seq: string
  //rev: boolean
  //comp: boolean
}

export type FORMAT_TYPE = 'auto' | 'lower' | 'upper'

interface IDNAOptions {
  assembly?: string
  format?: FORMAT_TYPE
  mask?: '' | 'lower' | 'n'
  reverse?: boolean
  complement?: boolean
}

export async function createDNATable(
  df: BaseDataFrame,
  params: IDNAOptions = {}
): Promise<AnnotationDataFrame | null> {
  const { assembly, format, mask, reverse, complement } = {
    assembly: 'grch38',
    format: 'Auto',
    mask: '',
    reverse: false,
    complement: false,
    ...params,
  }

  const locCol = findCols(df, 'Location')[0]!

  if (locCol === -1) {
    return null
  }

  // let assemblyCol = findCol(df, 'assembly')

  // if (assemblyCol === -1) {
  //   assemblyCol = findCol(df, 'genome')
  // }

  const header: string[] = df.columns.concat(['DNA'])

  const locs: string[] = df.col(locCol).strs

  //.map(v => parseLocation(v.toString()))
  //.map(v => v!.toJson())

  //const a = assemblyCol !== -1 ? df.col(assemblyCol).strs : vfill(assembly, locs.length)

  try {
    const params = new URLSearchParams([
      ['format', format.toLowerCase()],
      ['mask', mask],
      ['rev', reverse.toString()],
      ['comp', complement.toString()],
    ])

    const res = await httpFetch.postJson<{ data: { seqs: { seq: string }[] } }>(
      `${API_DNA_URL}/${assembly}?${params}`,
      {
        body: { locations: locs },
      }
    )

    const data = res.data

    const table: SeriesData[][] = []

    for (const [ri, row] of df.values.entries()) {
      table.push(row.concat([data.seqs[ri]!.seq]))
    }

    return new AnnotationDataFrame({ data: table, columns: header })

    //data.push(row.concat([dj.data.dna]))
  } catch {
    //data.push(row.concat([""]))
  }

  return null
}

export async function fetchDNA(
  queryClient: QueryClient,
  location: IGenomicLocation,
  params: IDNAOptions = {}
): Promise<IDNA> {
  const {
    assembly = 'grch38',
    format = 'Auto',
    mask = '',
    reverse = false,
    complement = false,
  } = params

  const dna: IDNA = {
    location,
    seq: '',
  }

  try {
    const res = await queryClient.fetchQuery({
      queryKey: [
        'dna',
        assembly,
        location.toString(),
        format,
        mask,
        reverse,
        complement,
      ],
      staleTime: TIME_5_MINUTES_MS,
      queryFn: async () => {
        const params = new URLSearchParams([
          ['format', format],
          ['mask', mask],
          ['rev', reverse.toString()],
          ['comp', complement.toString()],
        ])

        //console.log({ locations: [location.toString()] })

        const res = await httpFetch.postJson<{
          data: { seqs: { seq: string }[] }
        }>(`${API_DNA_URL}/${assembly}?${params}`, {
          body: { locations: [location.toString()] },
        })

        return res.data
      },
    })

    //console.log(data)

    return {
      location,
      seq: res.seqs[0]!.seq,
      //rev: data.isRev,
      //comp: data.isComp,
    }
  } catch (error) {
    console.log(error)
  }

  return dna
}

export function useDNAQuery(
  location: IGenomicLocation | GenLoc,
  params: IDNAOptions = {}
) {
  const {
    assembly = 'grch38',
    format = 'Auto',
    mask = '',
    reverse = false,
    complement = false,
  } = params

  const l = locStr(location)

  return useQuery({
    queryKey: ['dna', assembly, l, format, mask, reverse, complement],
    staleTime: TIME_5_MINUTES_MS,
    queryFn: async () => {
      const params = new URLSearchParams([
        ['format', format],
        ['mask', mask],
        ['rev', reverse.toString()],
        ['comp', complement.toString()],
      ])

      //console.log({ locations: [location.toString()] })

      const res = await httpFetch.postJson<IDNAResp>(
        `${API_DNA_URL}/${assembly}?${params}`,
        {
          body: { locations: [l] },
        }
      )

      return { location, seq: res.data.seqs[0]!.seq }
    },
  })
}

export function dnaToJson(seqs: IDNA[]): string {
  return JSON.stringify(
    seqs.map((seq) => ({
      chr: seq.location.chr,
      start: seq.location.start,
      end: seq.location.end,
      dna: seq.seq,
      //rev: seq.rev,
      //comp: seq.comp,
    }))
  )
}
