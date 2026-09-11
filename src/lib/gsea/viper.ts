import { IDBEntity } from '@/interfaces/db-entity'
import { BaseDataFrame } from '../dataframe/base-dataframe'
import { makeUuid } from '../id'
import { argsort } from '../math/argsort'
import { range } from '../math/range'
import { ExtGSEA } from './ext-gsea'
import { IRankedGene } from './geneset'

interface IViperGene {
  name: string
  score: number
}

interface IViperTF extends IDBEntity {
  targets: { pos: IViperGene[]; neg: IViperGene[] }
}

interface IViper extends IDBEntity {
  signature: IRankedGene[]

  tfs: IViperTF[]
}

function dfToViper(df: BaseDataFrame): IViper {
  const genes = df.rowNames

  const scores = df.col(0).nums

  const idx = argsort(scores)

  const signature: IRankedGene[] = idx.map((i) => ({
    name: genes[i],
    score: scores[i],
    rank: i + 1,
  }))

  const tfs = range(1, df.shape[1]).map((i) => {
    const scores = df.col(i).nums

    const pos: IViperGene[] = []
    const neg: IViperGene[] = []

    for (const i of idx) {
      const gene: IViperGene = { name: genes[i], score: scores[i] }

      if (scores[i] === -1000) {
        continue
      }

      if (scores[i] > 0) {
        pos.push(gene)
      } else {
        neg.push(gene)
      }
    }

    return { id: makeUuid(), name: df.colName(i), targets: { pos, neg } }
  })

  return { id: makeUuid(), name: 'Viper', signature, tfs }
}

function viperToGsea(viper: IViper) {
  const exg = new ExtGSEA(viper.signature)

  for (const tf of viper.tfs) {
    const gs1 = {
      id: tf.id,
      name: tf.name,
      genes: tf.targets.pos.map((g) => g.name),
    }
    const gs2 = {
      id: tf.id,
      name: tf.name,
      genes: tf.targets.neg.map((g) => g.name),
    }

    const extGsea = exg.runExtGsea(gs1, gs2)

    const gsea1 = exg.runGSEA(gs1)
    const gsea2 = exg.runGSEA(gs2)
  }
}
