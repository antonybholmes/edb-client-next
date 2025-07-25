import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { API_GENOME_URL } from '@lib/edb/edb'
import { range } from '@lib/math/range'
import { QueryClient } from '@tanstack/react-query'

import { AnnotationDataFrame } from '../dataframe/annotation-dataframe'
import { httpFetch } from '../http/http-fetch'

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

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ['genes'],
      queryFn: () =>
        httpFetch.postJson<{
          data: {
            geneIds: string
            geneSymbols: string
            geneStrands: string
            promLabels: string
            tssDists: string
            closestGenes: {
              geneId: string
              geneSymbol: string
              strand: string
              promLabel: string
              tssDist: number
            }[]
          }[]
        }>(
          `${API_GENOME_URL}/annotate/${assembly}?tss=${tss[0]},${tss[1]}&n=${closest}`,
          {
            body: {
              locations,
            },
          }
        ),
    })

    const data = res.data

    const table: SeriesData[][] = []

    for (const [ri, row] of df.values.entries()) {
      const ann = data[ri]!

      console.log(ann)

      let newRow = row.concat(
        assembly,
        ann.geneIds,
        ann.geneSymbols,
        ann.geneStrands,
        ann.promLabels,
        ann.tssDists
      )

      newRow = newRow.concat(
        ann.closestGenes
          .map(
            (g: {
              geneId: string
              geneSymbol: string
              strand: string
              promLabel: string
              tssDist: number
            }) => [g.geneId, g.geneSymbol, g.strand, g.promLabel, g.tssDist]
          )
          .flat()
      )

      table.push(newRow)
    }

    const header: string[] = df.colNames
      .concat([
        'Assembly',
        'Gene ID',
        'Gene Symbol',
        'Gene Strand',
        `Relative To Gene (prom=-${tss[0] / 1000}/+${tss[1] / 1000}kb)`,
        'TSS Distance',
      ])
      .concat(
        range(closest)
          .map(i => [
            `${i + 1} Closest ID`,
            `${i + 1} Closest Gene Symbol`,
            `${i + 1} Closest Gene Strand`,
            `${i + 1} Relative To Gene (prom=-${tss[0] / 1000}/+${
              tss[1] / 1000
            }kb)`,
            `${i + 1} TSS Closest Distance`,
          ])
          .flat()
      )

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
  } catch {
    //data.push(row.concat([""]))
  }

  return null

  // console.log(`Annotating ${locations.length} rows...`)

  // let currentChr = ""
  // let gb: Buffer = Buffer.alloc(1)
  // let gbi: Uint32Array = new Uint32Array()
  // let gbc: Uint32Array = new Uint32Array()

  // const data: SeriesType[][] = []

  // for (let li = 0; li < locations.length; ++li) {
  //   const location = locations[li]

  //   //console.log(location)

  //   if (currentChr !== location.chr) {
  //     console.log(`Caching ${location.chr}...`)

  //     try {
  //       gb = await queryClient.fetchQuery("gene_db", async () => {
  //         const res = await fetch(
  //           `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.name}/${location.chr}.gb`,
  //         )

  //         if (!res.ok) {
  //           throw new Error("Network response was not ok")
  //         }

  //         return res.arrayBuffer()
  //       })

  //       gbi = await queryClient.fetchQuery("gene_index", async () => {
  //         const res = await fetch(
  //           `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.name}/${location.chr}.gbi`,
  //         )

  //         if (!res.ok) {
  //           throw new Error("Network response was not ok")
  //         }

  //         return new Uint32Array(await res.arrayBuffer())
  //       })

  //       gbc = await queryClient.fetchQuery("gene_closest", async () => {
  //         const res = await fetch(
  //           `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.name}/${location.chr}.gbc`,
  //         )

  //         if (!res.ok) {
  //           throw new Error("Network response was not ok")
  //         }

  //         return new Uint32Array(await res.arrayBuffer())
  //       })

  //       // let url =
  //       // console.log(url)
  //       // response = await axios.get(url, {
  //       //   headers: {
  //       //     "Content-Type": "binary/octet-stream",
  //       //   },
  //       //   responseType: "arraybuffer",
  //       // })

  //       // gb = Buffer.from(response.data)

  //       // url =
  //       // response = await axios.get(url, {
  //       //   headers: {
  //       //     "Content-Type": "binary/octet-stream",
  //       //   },
  //       //   responseType: "arraybuffer",
  //       // })

  //       // gbi = new Uint32Array(response.data)

  //       // url = `${GENES_BASE_URL}/${dataSet.genome}/${dataSet.assembly}/${dataSet.name}/${location.chr}.gbc`
  //       // response = await axios.get(url, {
  //       //   headers: {
  //       //     "Content-Type": "binary/octet-stream",
  //       //   },
  //       //   responseType: "arraybuffer",
  //       // })

  //       // gbc = new Uint32Array(response.data)
  //     } catch (error) {
  //       console.warn(error)
  //     }

  //     currentChr = location.chr
  //   }

  //   const row: SeriesType[] = makeCells(location.toString()) //, locWidth(location))

  //   if (within) {
  //     const genes = getWithinTranscripts(dataSet, location, gb, gbi)
  //     row.push(makeCell(genes.map(gene => gene.geneId).join(";")))
  //     row.push(makeCell(genes.map(gene => gene.geneSymbol).join(";")))
  //   }

  //   if (closest) {
  //     const values = Array(10).fill(NA)
  //     const genes = getClosestTranscripts(dataSet, location, gb, gbi, gbc)

  //     let vi = 0

  //     genes.forEach(gene => {
  //       values[vi++] = gene.geneId
  //       values[vi++] = gene.geneSymbol
  //     })

  //     row.push(...values)
  //   }

  //   data.push(row)

  //   if (li > 0 && li % 1000 === 0) {
  //     console.log(`Processed ${li} rows.`)
  //   }
  // }

  // console.log("Finished.")

  // return new DataFrame({ data, columns: header })
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
