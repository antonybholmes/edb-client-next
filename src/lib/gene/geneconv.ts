import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { API_GENECONV_URL } from '@/components/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { capitalCase } from '@/lib/text/capital-case'

import { AnnotationDataFrame } from '../dataframe/annotation-dataframe'
import type { SeriesData } from '../dataframe/series-data'

export type Species = 'human' | 'mouse' | 'fly' | 'worm' | 'yeast'

export interface IConversionGene {
  geneId: string
  symbol: string
  entrez: string
  ensembl: string
  previousSymbols?: string[]
}

export interface IMapping {
  from: IConversionGene
  to: IConversionGene
}

export interface IConversion {
  search: string
  mappings: IMapping[]
}

export interface ITaxonomy {
  id: string
  species: string
}

export interface IConversionResult {
  from: ITaxonomy
  to: ITaxonomy
  conversions: IConversion[]
}

export async function createGeneConvTable(
  df: BaseDataFrame,
  opt: {
    fromSpecies?: Species
    toSpecies?: Species
    exact?: boolean
    col?: number | string
  } = {}
): Promise<AnnotationDataFrame> {
  const {
    fromSpecies = 'human',
    toSpecies = 'mouse',
    exact = true,
    col = 0,
  } = opt

  //let assemblyCol = findCol(df, "assembly")

  const genes = df.col(col)?.values

  const res = await httpFetch.postJson<{
    data: {
      conversions: IConversion[]
    }
  }>(`${API_GENECONV_URL}/convert/${fromSpecies}/${toSpecies}`, {
    body: {
      searches: genes,
      exact,
    },
  })

  // conversions store data in conversions entry,
  // but the entries are the same as for gene info
  // so we can just step 1 deeper into structure
  // and continue as normal
  // if (fromSpecies != toSpecies) {
  //  data = data.conversions
  // }

  const data = res.data.conversions

  const table: SeriesData[][] = []

  for (const [ri, row] of df.values.entries()) {
    const conv = data[ri]!

    let symbol = ''
    let entrez = ''
    //let refseq = ""
    let ensembl = ''

    if (conv.mappings.length > 0) {
      symbol = conv.mappings[0]!.to.symbol
      entrez = conv.mappings[0]!.to.entrez

      ensembl = conv.mappings[0]!.to.ensembl
    }

    table.push(row.concat(symbol, entrez, ensembl))
  }

  const speciesHeader = capitalCase(toSpecies)

  const header: string[] = df.columns.concat([
    `${speciesHeader} Gene Symbol`,
    `${speciesHeader} Entrez`,
    `${speciesHeader} Ensembl`,
  ])

  return new AnnotationDataFrame({ data: table, columns: header })
}
