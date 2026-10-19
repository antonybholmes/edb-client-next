import type { Cell } from '../../../../../lib/dataframe/cell'
import { PathwayOverlap } from '../../../../../lib/gene/pathway/pathway'
import type { ICollection, IGeneSet } from '../gsea/gsea-plot/geneset'

export interface IPathwayWorkerMessage {
  genesets: IGeneSet[]
  collections: ICollection[]
  genesInUniverse: number
}

export interface IPathwayWorkerResult {
  data: Cell[][]
  columns: string[]
}

self.onmessage = function (e: MessageEvent<IPathwayWorkerMessage>) {
  const { genesets, collections, genesInUniverse } = e.data

  const overlap = new PathwayOverlap(genesInUniverse)

  for (const collection of collections) {
    overlap.addDataset(collection)
  }

  const [data, columns] = overlap.test(genesets)

  // let idx = where(
  //   range(data.length).map(i => data[i][10] as number),
  //   x => x > 0,
  // )
  // data = idx.map(i => data[i])

  self.postMessage({ data, columns } as IPathwayWorkerResult)
}
