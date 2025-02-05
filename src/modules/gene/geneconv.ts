import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { API_GENECONV_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { DataFrame } from '@lib/dataframe/dataframe'
import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { capitalCase } from '@lib/text/capital-case'
import { QueryClient } from '@tanstack/react-query'

export async function createGeneConvTable(
  queryClient: QueryClient,
  df: BaseDataFrame,
  fromSpecies: string = 'human',
  toSpecies: string = 'mouse',
  exact: boolean = true
): Promise<BaseDataFrame | null> {
  const geneCol = 0

  //let assemblyCol = findCol(df, "assembly")

  const genes = df.col(geneCol)?.values

  try {
    const res = await queryClient.fetchQuery({
      queryKey: ['motiftogene'],
      queryFn: () =>
        httpFetch.postJson(
          `${API_GENECONV_URL}/convert/${fromSpecies}/${toSpecies}`,
          {
            body: {
              searches: genes,
              exact,
            },
          }
        ),
    })

    let data = res.data

    // conversions store data in conversions entry,
    // but the entries are the same as for gene info
    // so we can just step 1 deeper into structure
    // and continue as normal
    // if (fromSpecies != toSpecies) {
    //  data = data.conversions
    // }

    data = data.conversions

    const table: SeriesData[][] = []

    for (const [ri, row] of df.values.entries()) {
      const conv = data[ri]

      let symbol = ''
      let entrez = ''
      //let refseq = ""
      let ensembl = ''

      if (conv.length > 0) {
        symbol = conv[0].symbol
        entrez = conv[0].entrez
        //refseq = conv[0].refseq.join("|")
        ensembl = conv[0].ensembl //.join("|")
      }

      table.push(row.concat(symbol, entrez, ensembl))
    }

    const speciesHeader = capitalCase(toSpecies)

    const header: string[] = df.colNames.concat([
      `${speciesHeader} Gene Symbol`,
      `${speciesHeader} Entrez`,
      `${speciesHeader} Ensembl`,
    ])

    return new DataFrame({ data: table, columns: header })

    //data.push(row.concat([dj.data.dna]))
  } catch {
    //data.push(row.concat([""]))
  }

  return null
}
