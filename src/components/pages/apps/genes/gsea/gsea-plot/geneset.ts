import type { IDBEntity } from '@/interfaces/db-entity'
import { randomHexColor } from '../../../../../../lib/color/color'
import { makeUuid } from '../../../../../../lib/id'

/**
 * Represents a gene and its associated score
 * which can be useful in Viper output where the
 * gene has an associated score to indicate
 * strength or significance of its association.
 * For basic GSEA, the score may not be necessary and can be ignored.
 */
export interface IScoreGene {
  name: string
  /**
   * The primary score associated with the gene. In regular
   * GSEA this will be ignored so set to 1, but in viper we
   * can use it as a scaling factor per gene hit.
   */
  score: number
}

export interface IESScoreGene extends IScoreGene {
  /**
   * The enrichment score (ES) associated with the gene.
   */
  esScore?: number
}

export interface IRankedGene extends IESScoreGene {
  rank: number
  leading?: boolean
}

export function sortRankedGenes(
  genes: IRankedGene[],
  maxRank: number,
  opts: { reverse?: boolean } = {}
): IRankedGene[] {
  const { reverse = false } = opts
  return (
    reverse
      ? genes.map((e) => ({
          ...e,
          rank: maxRank - e.rank,
          score: -e.score,
          esScore: e.esScore !== undefined ? -e.esScore : undefined,
        }))
      : [...genes]
  ).sort((a, b) => a.rank - b.rank)
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
export function geneSetScores(
  geneset: IGeneSet,
  defaultScore: number = 1
): IScoreGene[] {
  return geneset.genes.map((g, gi) =>
    typeof g === 'string' ? { name: g, score: defaultScore } : g
  )
}
