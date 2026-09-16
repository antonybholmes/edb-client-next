import { IDBEntity } from '../../../../../../interfaces/db-entity'
import { makeUuid } from '../../../../../../lib/id'
import { IGeneSet, IRankedGene } from '../gsea-plot/geneset'
import { ExtGSEA } from './ext-gsea'
import { IExtGseaPlotResult } from './ext-gsea-provider'

export interface IViperTF extends IDBEntity {
  targets: { pos: IRankedGene[]; neg: IRankedGene[] }
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
      name: 'Activated',
      genes: tf.targets.pos,
      //color: COLOR_RED,
    }
    const gs2: IGeneSet = {
      id: makeUuid(),
      name: 'Repressed',
      genes: tf.targets.neg,
      //color: COLOR_CORNFLOWER_BLUE,
    }

    const extGsea = exg.runExtGsea(gs1, gs2)

    const gsea1 = exg.runGSEA(gs1)
    const gsea2 = exg.runGSEA(gs2)

    const p: IExtGseaPlotResult = {
      id: tf.id,
      name: tf.name,
      scores: viper.signature,
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
