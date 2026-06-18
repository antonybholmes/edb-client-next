import type { IDBEntity } from '@/interfaces/db-entity'
import type { IClusterGroup } from '../cluster-group'
import { randomHexColor } from '../color/color'
import { makeUuid } from '../id'

export interface IGeneSet extends IDBEntity {
  genes: string[]
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

export interface IRankedGene {
  name: string
  score: number
  rank: number
}

export interface IRankedGenes {
  group1: IClusterGroup
  group2: IClusterGroup
  genes: IRankedGene[]
}

export function makeNewGeneset(name: string = 'Gene Set 1'): IGeneSet {
  return {
    id: makeUuid(),
    name,
    genes: [],
    color: randomHexColor(),
    //type: 'geneset',
  }
}
