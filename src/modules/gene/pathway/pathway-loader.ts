import { randomHexColor } from '@/lib/color'

import type { IGeneset } from '@/lib/gsea/geneset'
import { textToLines } from '@/lib/text/lines'
import { nanoid } from '@/lib/utils'
import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'
import type { IGeneSetFile } from './pathway'

export async function loadGMT(
  queryClient: QueryClient,
  file: IGeneSetFile
): Promise<IGeneset[]> {
  const geneSets: IGeneset[] = []

  try {
    //const content = await fetchData(file.url)

    const res = await queryClient.fetchQuery({
      queryKey: ['gmt'],
      queryFn: () => axios.get(file.url),
    })

    //const content = res.data

    //const response = await axios.get(file.url);
    //const buffer = await response.data;
    //const content = await zlib.gunzipSync(buffer).toString();

    const lines: string[] = textToLines(res.data)

    console.log('loaded from', file.url, lines.length)

    lines.forEach((line) => {
      const tokens = line.split('\t')

      geneSets.push({
        id: nanoid(),
        name: tokens[0]!,
        genes: tokens.slice(2),
        color: randomHexColor(),
      })

      // lines[0].split("\t").forEach(gs => {
      //   retMap[gs] = new Set<string>()
      // })

      // lines.slice(2).forEach(line => {
      //   line.split("\t").forEach((gene, genei) => {
      //     if (gene.length > 0 && gene !== "----") {
      //       retMap[geneSets[genei]].add(gene)
      //     }
      //   })
      // })
    })
  } catch (error) {
    console.error(error)
  }

  return geneSets
}
