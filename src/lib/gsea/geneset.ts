import type { IClusterGroup } from '../cluster-group'
import { randomHexColor } from '../color/color'
import { makeUUIDv7 } from '../id'

export interface IGeneset {
  id: string
  name: string
  genes: string[]
  color: string
}

export const EMPTY_GENE_SET: IGeneset = {
  id: '',
  name: '',
  genes: [],
  color: '',
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
    id: makeUUIDv7(),
    name,
    genes: [],
    color: randomHexColor(),
  }
}
