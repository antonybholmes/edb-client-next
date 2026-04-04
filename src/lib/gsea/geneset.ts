import type { IDBEntity } from '@/interfaces/db-entity'
import type { IClusterGroup } from '../cluster-group'
import { randomHexColor } from '../color/color'
import { makeUuid } from '../id'

export interface IGeneset extends IDBEntity {
  genes: string[]
  color: string
  type: 'geneset'
}

export const EMPTY_GENE_SET: IGeneset = {
  id: '',
  name: '',
  genes: [],
  color: '',
  type: 'geneset',
}

export interface IRankedGenes {
  group1: IClusterGroup
  group2: IClusterGroup
  genes: IRankedGene[]
}

export interface IRankedGene {
  name: string
  score: number
  rank: number
}

export function makeNewGeneset(name: string = 'Gene Set 1'): IGeneset {
  return {
    id: makeUuid(),
    name,
    genes: [],
    color: randomHexColor(),
    type: 'geneset',
  }
}
