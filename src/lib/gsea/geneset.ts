import type { IDBEntity } from '@/interfaces/db-entity'
import { randomHexColor } from '../color/color'
import { makeUuid } from '../id'

export interface IScoreGene {
  name: string
  score: number
}

export interface IGeneSet extends IDBEntity {
  genes: IScoreGene[]
  color?: string
  //type: 'geneset'
}

export interface ICollection extends IDBEntity {
  genesets: IGeneSet[]
}

export interface IDataset extends IDBEntity {
  collections: ICollection[]
}

export const EMPTY_GENE_SET: IGeneSet = {
  id: '',
  name: '',
  genes: [],
  //color: '',
  //type: 'geneset',
}

export interface IRankedGene extends IScoreGene {
  rank: number
  leading?: boolean
}

// export interface IRankedGenes {
//   group1: IClusterGroup
//   group2: IClusterGroup
//   genes: IRankedGene[]
// }

export function makeNewGeneset(name: string = 'Gene Set 1'): IGeneSet {
  return {
    id: makeUuid(),
    name,
    genes: [],
    color: randomHexColor(),
    //type: 'geneset',
  }
}
