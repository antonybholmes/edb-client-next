import type { IRankedGenes } from '../../../../../../lib/gsea/geneset'

import {
  ExtGSEA,
  type IExtGseaResult,
  type IGseaResult,
} from '../../../../../../lib/gsea/ext-gsea'
import type { IGeneSet } from '../../../../../../lib/gsea/geneset'

export interface IExtGseaWorkerMessage {
  rankedGenes: IRankedGenes
  gs1: IGeneSet
  gs2: IGeneSet
}

export interface IExtGseaWorkerResult {
  extGseaRes: IExtGseaResult
  gseaRes1: IGseaResult
  gseaRes2: IGseaResult
}

self.onmessage = function (e: MessageEvent<IExtGseaWorkerMessage>) {
  const { rankedGenes, gs1, gs2 } = e.data

  //console.log('Worker received data:', e.data)

  const extGsea = new ExtGSEA(rankedGenes)

  const extGseaRes = extGsea.runExtGsea(gs1, gs2)

  const gseaRes1 = extGsea.runGSEA(extGsea.gs1)

  const gseaRes2 = extGsea.runGSEA(extGsea.gs2)

  //console.log('Worker computed results:', { extGseaRes, gseaRes1, gseaRes2 })

  self.postMessage({ extGseaRes, gseaRes1, gseaRes2 } as IExtGseaWorkerResult)
}
