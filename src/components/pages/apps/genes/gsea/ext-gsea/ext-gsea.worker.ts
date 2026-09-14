import type { IRankedGene } from '../gsea-plot/geneset'

import type { IGeneSet } from '../gsea-plot/geneset'
import { ExtGSEA, type IExtGseaResult, type IGseaResult } from './ext-gsea'

export interface IExtGseaWorkerMessage {
  scores: IRankedGene[]
  gs1: IGeneSet
  gs2: IGeneSet
}

export interface IExtGseaWorkerResult {
  extGseaRes: IExtGseaResult
  gseaRes1: IGseaResult
  gseaRes2: IGseaResult
}

self.onmessage = function (e: MessageEvent<IExtGseaWorkerMessage>) {
  const { scores, gs1, gs2 } = e.data

  const extGsea = new ExtGSEA(scores)

  const extGseaRes = extGsea.runExtGsea(gs1, gs2)

  const gseaRes1 = extGsea.runGSEA(extGsea.gs1)

  const gseaRes2 = extGsea.runGSEA(extGsea.gs2)

  self.postMessage({ extGseaRes, gseaRes1, gseaRes2 } as IExtGseaWorkerResult)
}
