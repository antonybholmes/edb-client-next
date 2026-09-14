import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'

import { IRankedGene } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { makeUuid } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { range } from '@/lib/math/range'
import { IViper } from './viper-gsea'

export function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  const scores = df.col(0).nums

  // want largest to smallest
  const idx = argsort(scores, { reverse: true })

  const signature: IRankedGene[] = idx.map((originalIndex, i) => ({
    name: genes[originalIndex],
    score: scores[originalIndex],
    rank: i,
  }))

  const tfs = range(1, df.shape[1]).map((tfi) => {
    const scores = df.col(tfi).nums

    let pos: IRankedGene[] = []
    let neg: IRankedGene[] = []

    for (const gi of idx) {
      const gene: IRankedGene = { name: genes[gi], score: scores[gi], rank: 0 }

      if (scores[gi] === -1000) {
        continue
      }

      if (scores[gi] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    pos = argsort(
      pos.map((g) => g.score),
      { reverse: true, abs: true }
    ).map((i) => ({ ...pos[i], rank: i }))
    neg = argsort(
      neg.map((g) => g.score),
      { reverse: true, abs: true }
    ).map((i) => ({ ...neg[i], rank: i }))

    return { id: makeUuid(), name: df.colName(tfi), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}
