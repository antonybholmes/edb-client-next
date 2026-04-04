import { randomHexColor } from '@/lib/color/color'

import type { IGeneset } from '@/lib/gsea/geneset'
import { httpFetch } from '@/lib/http/http-fetch'
import { makeUuid } from '@/lib/id'
import { textToLines } from '@/lib/text/lines'
import type { IGeneSetFile } from './pathway'

export async function loadGMT(file: IGeneSetFile): Promise<IGeneset[]> {
  const geneSets: IGeneset[] = []

  try {
    //const content = await fetchData(file.url)

    const res = await httpFetch.getText(file.url)

    const lines: string[] = textToLines(res)

    console.log('loaded from', file.url, lines.length)

    lines.forEach(line => {
      const tokens = line.split('\t')

      geneSets.push({
        id: makeUuid(),
        type: 'geneset',
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
