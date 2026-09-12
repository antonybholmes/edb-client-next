import { IDBEntity } from '../../../../../../interfaces/db-entity'
import { ExtGSEA } from '../../../../../../lib/gsea/ext-gsea'
import {
  IGeneSet,
  IRankedGene,
  IScoreGene,
} from '../../../../../../lib/gsea/geneset'
import { makeUuid } from '../../../../../../lib/id'
import { IExtGseaPlotResult } from './ext-gsea-provider'

export interface IViperTF extends IDBEntity {
  targets: { pos: IScoreGene[]; neg: IScoreGene[] }
}

export interface IViper extends IDBEntity {
  signature: IRankedGene[]

  tfs: IViperTF[]
}

export function viperToGsea(
  viper: IViper,
  opts: { useGeneScoreForES?: boolean } = {}
): IExtGseaPlotResult[] {
  const { useGeneScoreForES = true } = opts

  const exg = new ExtGSEA(viper.signature, { useGeneScoreForES })

  const plots: IExtGseaPlotResult[] = []

  for (const tf of viper.tfs) {
    const gs1: IGeneSet = {
      id: makeUuid(),
      name: 'Up',
      genes: tf.targets.pos,
      //color: COLOR_RED,
    }
    const gs2: IGeneSet = {
      id: makeUuid(),
      name: 'Down',
      genes: tf.targets.neg,
      //color: COLOR_CORNFLOWER_BLUE,
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
