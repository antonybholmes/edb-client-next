import type { IRankedGenes } from '../../../../../../lib/gsea/geneset'

import { ExtGSEA } from '../../../../../../lib/gsea/ext-gsea'
import type { IGeneset } from '../../../../../../lib/gsea/geneset'

self.onmessage = function (
  e: MessageEvent<{ rankedGenes: IRankedGenes; gs1: IGeneset; gs2: IGeneset }>
) {
  const { rankedGenes, gs1, gs2 } = e.data

  const extGsea = new ExtGSEA(rankedGenes)

  const extGseaRes = extGsea.runExtGsea(gs1, gs2)

  const gseaRes1 = extGsea.runGSEA(extGsea.gs1)

  const gseaRes2 = extGsea.runGSEA(extGsea.gs2)

  self.postMessage({ extGseaRes, gseaRes1, gseaRes2 })
}
