import { IDBEntity } from '@/interfaces/db-entity'
import { COLOR_CORNFLOWER_BLUE, COLOR_RED } from '@/lib/color/color'
import { BaseDataFrame } from '../../../../../../lib/dataframe/base-dataframe'
import { ExtGSEA } from '../../../../../../lib/gsea/ext-gsea'
import { IRankedGene } from '../../../../../../lib/gsea/geneset'
import { makeUuid } from '../../../../../../lib/id'
import { argsort } from '../../../../../../lib/math/argsort'
import { range } from '../../../../../../lib/math/range'
import { IExtGseaPlotResult } from './ext-gsea-provider'

interface IViperGene {
  name: string
  score: number
}

export interface IViperTF extends IDBEntity {
  targets: { pos: IViperGene[]; neg: IViperGene[] }
}

export interface IViper extends IDBEntity {
  signature: IRankedGene[]

  tfs: IViperTF[]
}

export function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  const scores = df.col(0).nums

  // want largest to smallest
  const idx = argsort(scores, true)

  const signature: IRankedGene[] = idx.map((originalIndex, i) => ({
    name: genes[originalIndex],
    score: scores[originalIndex],
    rank: i,
  }))

  const tfs = range(1, df.shape[1]).map((tfi) => {
    const scores = df.col(tfi).nums

    const pos: IViperGene[] = []
    const neg: IViperGene[] = []

    for (const gi of idx) {
      const gene: IViperGene = { name: genes[gi], score: scores[gi] }

      if (scores[gi] === -1000) {
        continue
      }

      if (scores[gi] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    return { id: makeUuid(), name: df.colName(tfi), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}

export function viperToGsea(viper: IViper): IExtGseaPlotResult[] {
  const exg = new ExtGSEA(viper.signature)

  const plots: IExtGseaPlotResult[] = []

  for (const tf of viper.tfs) {
    const gs1 = {
      id: makeUuid(),
      name: 'Up',
      genes: tf.targets.pos.map((g) => g.name),
      color: COLOR_RED,
    }
    const gs2 = {
      id: makeUuid(),
      name: 'Down',
      genes: tf.targets.neg.map((g) => g.name),
      color: COLOR_CORNFLOWER_BLUE,
    }

    const extGsea = exg.runExtGsea(gs1, gs2)

    const gsea1 = exg.runGSEA(gs1)
    const gsea2 = exg.runGSEA(gs2)

    const p: IExtGseaPlotResult = {
      id: tf.id,
      name: tf.name,
      rankedGenes: viper.signature,
      gs1,
      gs2,
      extGsea,
      gsea1,
      gsea2,
    }

    plots.push(p)

    console.log(p)
  }
  return plots
}
