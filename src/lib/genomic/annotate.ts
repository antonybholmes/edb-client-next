import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { range } from '@/lib/math/range'

import { API_GENOME_URL } from '../../components/edb/genome'
import { AnnotationDataFrame } from '../dataframe/annotation-dataframe'
import type { SeriesData } from '../dataframe/series-data'
import { httpFetch } from '../http/http-fetch'
import type { IGenomicFeature } from './genomic-feature'

const PAGE_SIZE = 100

export interface ITSS {
  prom5p: number
  prom3p: number
}

/**
 * Annotate locations with gene symbols.
 *
 * @param df   the dataframe to annotate.
 * @param dataSet     the gene database to use for annotations.
 * @param opts        options for annotation.
 * @returns
 */
export async function createAnnotationTable(
  df: BaseDataFrame,
  assembly: string,
  opts: {
    col?: number // which column contains the genomic locations. Default is 0.
    closest?: number // how many closest genes to return
    tss?: ITSS // how far upstream and downstream of TSS to consider for promoter annotations, in bp. Default is 2kb upstream and 1kb downstream.
    useOfficialGenes?: boolean // whether to use official gene symbols
    pageSize?: number // maximum number of records to annotate, for performance. Default is 100.
  } = {}
): Promise<AnnotationDataFrame | null> {
  const {
    col = 0,
    closest = 5,
    tss = { prom5p: 2000, prom3p: 1000 },
    useOfficialGenes = true,
    pageSize = PAGE_SIZE,
  } = opts

  //const locations:Location[] = df.col(col)!.values.map(l=>parseLocation(l as string)!)
  const locations: string[] = df.col(col).strs

  const allData: {
    withinGenes: IGenomicFeature[]
    closestGenes: IGenomicFeature[]
  }[] = []

  const url = `${API_GENOME_URL}/gtfs/${assembly}/annotate?promoter=${tss.prom5p},${tss.prom3p}&closest=${closest}&use_official=${useOfficialGenes ? 1 : 0}`

  // split into pages to avoid overloading the server. Note that
  // server has its own internal limits, so even if you send a large batch, it may not return all results.

  let idx = 0

  while (idx < locations.length) {
    // Attempt to annotate a batch of locations. The server may return fewer results than requested,
    // so we increment the index by the actual number of records returned to avoid skipping records.
    const locs = locations.slice(idx, idx + pageSize)

    const res = await httpFetch.postJson<{
      data: {
        withinGenes: IGenomicFeature[]
        closestGenes: IGenomicFeature[]
      }[]
    }>(url, {
      body: {
        locations: locs,
      },
    })

    const data = res.data

    allData.push(...data)

    // increment by the actual number of records returned, not the page size,
    // to avoid skipping records if server returns less than requested
    idx += data.length
  }

  const table: SeriesData[][] = []
  let hasClosest = false

  for (const [ri, row] of df.values.entries()) {
    const ann = allData[ri]!

    const geneIds: string[] = []
    const geneSymbols: string[] = []
    const strands: string[] = []
    const promLabels: string[] = []
    const tssDists: number[] = []

    for (const g of ann.withinGenes) {
      geneIds.push(g.geneId!)
      geneSymbols.push(g.symbol!)
      strands.push(g.loc.strand)
      promLabels.push(g.label ?? '')
      tssDists.push(g.tssDist!)
    }

    let newRow = row.concat(
      assembly,
      geneIds.join('|'),
      geneSymbols.join('|'),
      strands.join('|'),
      promLabels.join('|'),
      tssDists.join('|')
    )

    newRow = newRow.concat(
      ann.closestGenes
        .map((g) => [
          g.geneId!,
          g.symbol!,
          g.loc.strand!,
          g.label ?? '',
          g.tssDist ?? 0,
        ])
        .flat()
    )

    if (ann.closestGenes.length > 0) {
      hasClosest = true
    }

    table.push(newRow)
  }

  let header: string[] = df.columns.concat([
    'Assembly',
    'Gene Id',
    'Gene Symbol',
    'Gene Strand',
    `Relative To Gene (prom=-${tss.prom5p / 1000}/+${tss.prom3p / 1000}kb)`,
    'TSS Distance',
  ])

  // if we detected that closest genes were requested, add headers for them
  if (hasClosest) {
    header = header.concat(
      range(closest)
        .map((i) => [
          `#${i + 1} Closest Id`,
          `#${i + 1} Closest Gene Symbol`,
          `#${i + 1} Closest Gene Strand`,
          `#${i + 1} Relative To Gene (prom=-${tss.prom5p / 1000}/+${tss.prom3p / 1000}kb)`,
          `#${i + 1} TSS Closest Distance`,
        ])
        .flat()
    )
  }

  return new AnnotationDataFrame({ data: table, columns: header })
}

export async function createAnnotationFile(
  df: BaseDataFrame,
  assembly: string,
  opts: {
    closest?: number
    tss?: { prom5p: number; prom3p: number }
    useOfficialGenes?: boolean
  } = {}
): Promise<string | null> {
  const {
    closest = 5,
    tss = { prom5p: 2000, prom3p: 1000 },
    useOfficialGenes = true,
  } = opts
  const table = await createAnnotationTable(df, assembly, {
    closest,
    tss,
    useOfficialGenes,
  })

  if (!table) {
    return null
  }

  return table.values.map((row) => row.join('\t')).join('\n')
}
