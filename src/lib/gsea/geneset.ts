import type { IClusterGroup } from '../cluster-group'
import { randomHexColor } from '../color/color'
import { nanoid } from '../utils'

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
    id: nanoid(),
    name,
    genes: [],
    color: randomHexColor(),
  }
}
