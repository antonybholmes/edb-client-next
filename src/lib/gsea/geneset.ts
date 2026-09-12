import type { IDBEntity } from '@/interfaces/db-entity'
import { randomHexColor } from '../color/color'
import { makeUuid } from '../id'

/**
 * Represents a gene and its associated score
 * which can be useful in Viper output where the
 * gene has an associated score to indicate
 * strength or significance of its association.
 * For basic GSEA, the score may not be necessary and can be ignored.
 */
export interface IScoreGene {
  name: string
  score: number
}

export interface IGeneSet extends IDBEntity {
  /**
   * The name of the gene set.
   */
  name: string

  /**
   * The genes contained in the gene set. Each gene can be represented
   * either as an IScoreGene object or as a string (gene name).
   * If a gene is represented as a string, it is assumed to have
   * a default score of 1 so that scaling by gene score can be ignored
   * as multiplying by 1 has no effect. If a gene is represented as an
   * IScoreGene object, its score will be used for scaling.
   */
  genes: (IScoreGene | string)[]

  /**
   * Optional color associated with the gene set.
   * This can be used for visualization purposes.
   */
  color?: string
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

/**
 * Returns the names of the genes in the gene set. If geneset genes are
 * represented as strings, their names are used directly.
 *
 * @param geneset The gene set from which to extract gene names.
 * @returns An array of gene names contained in the gene set.
 */
export function geneSetNames(geneset: IGeneSet): string[] {
  return geneset.genes.map((g) => (typeof g === 'string' ? g : g.name))
}

/**
 * Returns the scores of the genes in the gene set. If geneset genes are
 * represented as strings, they are assigned a default score of 1,
 * while numeric scores are used as-is.
 *
 * @param geneset The gene set from which to extract gene scores.
 * @returns An array of gene scores contained in the gene set. If a gene is represented as a string, it is assigned a default score of 1.
 */
export function geneSetScores(geneset: IGeneSet): number[] {
  return geneset.genes.map((g) => (typeof g === 'string' ? 1 : g.score))
}
