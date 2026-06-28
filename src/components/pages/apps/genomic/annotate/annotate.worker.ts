// workers need relative paths to import modules
import type { SeriesData } from '../../../../../lib/dataframe/series-data'
import { EDB_API_URL } from '../../../../../lib/edb/edb'

import type { IGenomicFeature } from '../../../../../lib/genomic/genomic-feature'
import { httpFetch } from '../../../../../lib/http/http-fetch'
import { range } from '../../../../../lib/math/range'

export const API_GENOME_URL = `${EDB_API_URL}/modules/genome`

const PAGE_SIZE = 100

export interface IAnnotateWorkerMessage {
  id: string
  df: SeriesData[][]
  columns: string[]
  closest?: number
  tss?: { prom5p: number; prom3p: number }
  useOfficialGenes?: boolean
  col?: number
  pageSize?: number
  assembly?: string
}

export interface IAnnotationResultSuccess {
  id: string
  error: null
  header: string[]
  table: SeriesData[][]
}

export interface IAnnotationResultError {
  id: string
  error: string
  header: null
  table: null
}

export type IAnnotationResult =
  IAnnotationResultSuccess | IAnnotationResultError

self.onmessage = async function (e: MessageEvent<IAnnotateWorkerMessage>) {
  const {
    id,
    df,
    columns,
    col = 0,
    closest = 5,
    tss = { prom5p: 2000, prom3p: 1000 },
    useOfficialGenes = true,
    pageSize = PAGE_SIZE,
    assembly = 'hg19',
  } = e.data

  try {
    //const locations:Location[] = df.col(col)!.values.map(l=>parseLocation(l as string)!)
    const locations: string[] = df.map((row) => row[col] as string)

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

    for (const [ri, row] of df.entries()) {
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

    let header: string[] = columns.concat([
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

    self.postMessage({ id, error: null, header, table } as IAnnotationResult)
  } catch (error) {
    self.postMessage({
      id,
      error: (error as Error).message,
    } as IAnnotationResult)
  }
}
