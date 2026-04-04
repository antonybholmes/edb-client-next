import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { range } from '@/lib/math/range'
import { QueryClient } from '@tanstack/react-query'

import type { SeriesData } from '../dataframe'
import { AnnotationDataFrame } from '../dataframe/annotation-dataframe'
import { API_GENOME_URL } from '../edb/genome'
import { httpFetch } from '../http/http-fetch'
import type { IGenomicFeature } from './genomic'

const PAGE_SIZE = 50

/**
 * Annotate locations with gene symbols.
 *
 * @param df   the dataframe to annotate.
 * @param dataSet     the gene database to use for annotations.
 * @param opts        options for annotation.
 * @returns
 */
export async function createAnnotationTable(
  queryClient: QueryClient,
  df: BaseDataFrame,
  assembly: string,
  closest: number = 5,
  tss: [number, number] = [2000, 1000]
): Promise<AnnotationDataFrame | null> {
  const col = 0

  //const locations:Location[] = df.col(col)!.values.map(l=>parseLocation(l as string)!)
  const locations: string[] = df.col(col).strs

  const allData: {
    withinGenes: IGenomicFeature[]
    closestGenes: IGenomicFeature[]
  }[] = []

  for (const page of range(0, locations.length, PAGE_SIZE)) {
    const locs = locations.slice(page, page + PAGE_SIZE)
    console.log('annotating', page, locs.length)
  }

  try {
    for (const page of range(0, locations.length, PAGE_SIZE)) {
      const locs = locations.slice(page, page + PAGE_SIZE)
      console.log('annotating', page, locs.length)

      const res = await queryClient.fetchQuery({
        queryKey: ['genes'],
        queryFn: () =>
          httpFetch.postJson<{
            data: {
              withinGenes: IGenomicFeature[]
              closestGenes: IGenomicFeature[]
            }[]
          }>(
            `${API_GENOME_URL}/assemblies/${assembly}/annotate/?promoter=${tss[0]},${tss[1]}&closest=${closest}`,
            {
              body: {
                locations: locs,
              },
            }
          ),
      })

      const data = res.data

      allData.push(...data)
    }

    const table: SeriesData[][] = []
    let hasClosest = false

    for (const [ri, row] of df.values.entries()) {
      const ann = allData[ri]!

      console.log(ann, assembly, 'ss')

      const geneIds: string[] = []
      const geneSymbols: string[] = []
      const strands: string[] = []
      const promLabels: string[] = []
      const tssDists: number[] = []

      for (const g of ann.withinGenes) {
        geneIds.push(g.geneId!)
        geneSymbols.push(g.geneSymbol!)
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
          .map(g => [
            g.geneId!,
            g.geneSymbol!,
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

    console.log(table, 'table')

    let header: string[] = df.columns.concat([
      'Assembly',
      'Gene Id',
      'Gene Symbol',
      'Gene Strand',
      `Relative To Gene (prom=-${tss[0] / 1000}/+${tss[1] / 1000}kb)`,
      'TSS Distance',
    ])

    // if we detected that closest genes were requested, add headers for them
    if (hasClosest) {
      header = header.concat(
        range(closest)
          .map(i => [
            `#${i + 1} Closest Id`,
            `#${i + 1} Closest Gene Symbol`,
            `#${i + 1} Closest Gene Strand`,
            `#${i + 1} Relative To Gene (prom=-${tss[0] / 1000}/+${tss[1] / 1000}kb)`,
            `#${i + 1} TSS Closest Distance`,
          ])
          .flat()
      )
    }

    console.log(header.length, table[0]?.length, 'header')

    return new AnnotationDataFrame({ data: table, columns: header })

    // const table: SeriesType[][] = []

    // for (const [ri, row] of df.values.entries()) {
    //   const conv = data[ri]

    //   console.log(conv)

    //   let symbol = ""
    //   let entrez = -1
    //   let refseq = ""
    //   let ensembl = ""

    //   if (conv.genes.length > 0) {
    //     symbol = conv.genes[0].symbol
    //     entrez = conv.genes[0].entrez
    //     refseq = conv.genes[0].refseq.join("|")
    //     ensembl = conv.genes[0].ensembl.join("|")
    //   }

    //   table.push(row.concat(symbol, entrez, refseq, ensembl))
    // }

    // return new DataFrame({ data: table, columns: header })
  } catch (e) {
    console.error(e)
  }

  return null
}

export async function createAnnotationFile(
  queryClient: QueryClient,
  df: BaseDataFrame,
  assembly: string,
  closest: number = 5
): Promise<string | null> {
  const table = await createAnnotationTable(queryClient, df, assembly, closest)

  if (!table) {
    return null
  }

  return table.values.map(row => row.join('\t')).join('\n')
}
