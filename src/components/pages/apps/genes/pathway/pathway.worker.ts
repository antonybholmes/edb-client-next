import {
  PathwayOverlap,
  type IDataset,
} from '../../../../../lib/gene/pathway/pathway'
import type { IGeneset } from '../../../../../lib/gsea/geneset'

self.onmessage = function (
  e: MessageEvent<{ genesets: IGeneset[]; datasets: IDataset[] }>
) {
  const { genesets, datasets } = e.data

  const overlap = new PathwayOverlap()

  for (const dataset of datasets) {
    overlap.addDataset(dataset)
  }

  const [data, columns] = overlap.test(genesets)

  // let idx = where(
  //   range(data.length).map(i => data[i][10] as number),
  //   x => x > 0,
  // )
  // data = idx.map(i => data[i])

  self.postMessage({ data, columns })
}
