import { vfill } from '../fill'
import { abs } from '../math/abs'
import { sub } from '../math/add'
import { argsort } from '../math/argsort'
import { cumsum } from '../math/cumsum'
import { argmax, argmin, max, min } from '../math/math'

import { mean } from '../math/mean'
import { div, mult } from '../math/multiply'
import { ones } from '../math/ones'
import { pow } from '../math/power'
import { permutation } from '../math/random'
import { range } from '../math/range'
import { where } from '../math/where'
import { zeros } from '../math/zeros'

import {
  EMPTY_GENE_SET,
  geneSetNames,
  geneSetScores,
  type IGeneSet,
  type IRankedGene,
} from './geneset'

// https://www.mathworks.com/matlabcentral/fileexchange/33599-gsea2

export interface IExtGseaResult {
  esScore: number
  nes: number
  pvalue: number
  //leadingEdgeIndices,
  leadingEdge: IRankedGene[]
}

export interface IGseaResult {
  /**
   * The enrichment score for the gene set.
   */
  es: number

  /**
   * The scores of the genes that are hits in the gene set.
   */
  esHits: IRankedGene[]

  /**
   * Enrichment scores for all ranked genes. Will be several thousand
   */
  esAll: IRankedGene[]

  /**
   * Enrichment scores for leading edge genes in the gene set.
   */
  leadingEdge: IRankedGene[]
}

export class ExtGSEA {
  private _w: number
  private _np: number
  private _es: IRankedGene[]

  private _rkc: string[]
  private _rsc: number[]
  private _pn: number[]
  private _esScore: number
  private _pvalue: number
  private _leadingEdge: IRankedGene[]
  //private _bg: { es: number[] }
  //private _gsn1: string
  //private _gs1: string[]
  //private _gs2: string[]
  //private _gsn2: string
  //private _hits1: number[]
  //private _hits2: number[]
  //private _isgs: number[]
  private _scoreHits: number[]
  private _scoreMisses: number[]
  private _esAllGenes: number[]
  private _nes: number
  private _gs1: IGeneSet
  private _gs2: IGeneSet
  private _useGeneScoreForES: boolean
  //private _rankedScores: number[]

  constructor(
    es: IRankedGene[],

    opts: {
      permutations?: number
      w?: number
      useGeneScoreForES?: boolean
    } = {}
  ) {
    const { permutations = 1000, w = 1, useGeneScoreForES = false } = opts
    this._w = w
    this._np = permutations
    this._es = es
    this._useGeneScoreForES = useGeneScoreForES

    const numGenes = es.length

    // the negative versions are for the second gene set
    const names = es.map((g) => g.name)
    const scores = es.map((g) => g.score)

    const rk = [...names, ...names] //np.concatenate((ranked_gene_list, ranked_gene_list), axis=0)
    const rsc = [...scores, ...scores.map((x) => -x)] //np.concatenate((ranked_scores, -ranked_scores), axis=0)

    //descending order
    const ix = argsort(rsc).reverse()

    const pn = [...ones(numGenes), ...vfill(-1, numGenes)] //np.concatenate((np.ones(l), -np.ones(l)), axis=0)

    this._gs1 = { ...EMPTY_GENE_SET }
    this._gs2 = { ...EMPTY_GENE_SET }
    this._rkc = ix.map((i) => rk[i]!)
    this._rsc = ix.map((i) => rsc[i]!)
    this._pn = ix.map((i) => pn[i]!)

    // Defaults if nothing found
    this._esScore = -1
    this._nes = -1
    this._pvalue = -1
    this._leadingEdge = []
    //t//his._bg = { es: [] }

    //this._gsn1 = '1'
    //this._gsn2 = '2'

    //this._isgs = []
    //this._gs1 = []
    //t//his._gs2 = []
    //this._hits1 = []
    //this._hits2 = []
    this._scoreHits = []
    this._scoreMisses = []
    this._esAllGenes = []

    this._leadingEdge = []
  }

  get es(): IRankedGene[] {
    return [...this._es]
  }

  get gs1(): IGeneSet {
    return this._gs1
  }

  get gs2(): IGeneSet {
    return this._gs2
  }

  get nes(): number {
    return this._nes
  }

  get p(): number {
    return this._pvalue
  }

  runExtGsea(gs1: IGeneSet, gs2: IGeneSet): IExtGseaResult {
    this._gs1 = gs1
    this._gs2 = gs2

    const l = this._rkc.length

    // Is ranked gene in gene set
    const isInGeneset = zeros(l)

    const names1 = geneSetNames(gs1)
    const names2 = geneSetNames(gs2)
    const scores1 = geneSetScores(gs1)
    const scores2 = geneSetScores(gs2)

    const ids1 = new Set(names1)
    const ids2 = new Set(names2)

    const geneScores1 = new Map<string, number>(
      scores1.map((g) => [g.name, g.score])
    )

    const geneScores2 = new Map<string, number>(
      scores2.map((g) => [g.name, g.score])
    )

    for (const i of range(l)) {
      if (
        (this._pn[i]! > 0 && ids1.has(this._rkc[i]!)) ||
        (this._pn[i]! < 0 && ids2.has(this._rkc[i]!))
      ) {
        if (this._useGeneScoreForES) {
          // rather than using 1, we can weight the hits by the gene score
          isInGeneset[i] =
            this._pn[i]! > 0
              ? Math.abs(geneScores1.get(this._rkc[i]!) ?? 1)
              : Math.abs(geneScores2.get(this._rkc[i]!) ?? 1)
        } else {
          isInGeneset[i] = 1
        }
      }
    }

    this._scoreHits = cumsum(abs(pow(mult(this._rsc, isInGeneset), this._w)))

    this._scoreHits = div(
      this._scoreHits,
      this._scoreHits[this._scoreHits.length - 1]!
    )

    this._scoreMisses = cumsum(isInGeneset.map((v) => 1 - v))

    this._scoreMisses = div(
      this._scoreMisses,
      this._scoreMisses[this._scoreMisses.length - 1]!
    )

    this._esAllGenes = sub(this._scoreHits, this._scoreMisses)
    const { value: maxEs, index: maxEsIndex } = argmax(this._esAllGenes)
    const { value: minEs, index: minEsIndex } = argmin(this._esAllGenes)

    this._esScore = maxEs + minEs

    const isEnriched = zeros(l)

    if (this._esScore < 0) {
      for (const i of range(minEsIndex, isEnriched.length)) {
        isEnriched[i] = 1
      }

      // this._leadingEdge = this._rankedGenes
      //   .filter((_, gi) => isEnriched[gi] > 0 && isInGeneset[gi] > 0)
      //   .reverse()
    } else {
      for (const i of range(maxEsIndex + 1)) {
        isEnriched[i] = 1
      }
    }

    this._leadingEdge = this._es.filter(
      (_, gi) => isEnriched[gi] > 0 && isInGeneset[gi] > 0
    )

    if (this._np > 0) {
      const bgEs = zeros(this._np)
      const n = isInGeneset.length

      for (const i of range(this._np)) {
        const bgIsInGeneset = permutation(n).map((i) => isInGeneset[i]!)

        let bgHit = cumsum(pow(abs(mult(this._rsc, bgIsInGeneset)), this._w))
        bgHit = div(bgHit, bgHit[bgHit.length - 1]!)

        let bgMiss = cumsum(bgIsInGeneset.map((v) => 1 - v))
        bgMiss = div(bgMiss, bgMiss[bgMiss.length - 1]!)

        const bgAll = sub(bgHit, bgMiss)
        bgEs[i] = max(bgAll) + min(bgAll)
      }

      if (this._esScore < 0) {
        this._pvalue = bgEs.filter((v) => v <= this._esScore).length / this._np
        this._nes = this._esScore / Math.abs(mean(bgEs.filter((es) => es < 0)))
      } else {
        this._pvalue = bgEs.filter((v) => v >= this._esScore).length / this._np
        this._nes = this._esScore / Math.abs(mean(bgEs.filter((es) => es > 0)))
      }
    }

    return {
      esScore: this._esScore,
      nes: this._nes,
      pvalue: this._pvalue,
      leadingEdge: this._leadingEdge,
    }
  }

  runGSEA(gs1: IGeneSet): IGseaResult {
    const l = this._es.length

    const isInGeneset = zeros(l)

    const names1 = geneSetNames(gs1)
    const scores1 = geneSetScores(gs1)
    const ids1 = new Set(names1)

    const geneScores1 = new Map<string, number>(
      scores1.map((g) => [g.name, g.score])
    )

    for (const [index, gene] of this._es.entries()) {
      if (ids1.has(gene.name)) {
        isInGeneset[index] = this._useGeneScoreForES
          ? Math.abs(geneScores1.get(gene.name) ?? 1)
          : 1
      }
    }

    const scores = this._es.map((g) => g.score)

    // Compute ES
    let scoreHits = cumsum(pow(abs(mult(scores, isInGeneset)), this._w))
    scoreHits = div(scoreHits, scoreHits[scoreHits.length - 1]!)

    let scoreMisses = cumsum(isInGeneset.map((v) => 1 - v))
    scoreMisses = div(scoreMisses, scoreMisses[scoreMisses.length - 1]!)

    const esAll = sub(scoreHits, scoreMisses)
    const { value: maxEs, index: maxEsI } = argmax(esAll)
    const { value: minEs, index: minEsI } = argmin(esAll)
    const es = maxEs + minEs

    const leadingEdgeIndices = zeros(l)
    let leadingEdge: IRankedGene[] = []

    if (es < 0) {
      // where does the leading edge start
      //const ixpk = esAll.indexOf(minEs)

      for (const i of range(minEsI, leadingEdgeIndices.length)) {
        leadingEdgeIndices[i] = 1
      }

      // leadingEdge = this._es
      //   .filter((_, gi) => leadingEdgeIndices[gi] > 0 && isInGeneset[gi] > 0)
      //   .sort((r1, r2) => r1.rank - r2.rank)
      // //.reverse()
    } else {
      //const ixpk = esAll.indexOf(maxEs)

      for (const i of range(maxEsI + 1)) {
        leadingEdgeIndices[i] = 1
      }
    }

    leadingEdge = this._es
      .filter((_, gi) => leadingEdgeIndices[gi] > 0 && isInGeneset[gi] > 0)
      .sort((r1, r2) => r1.rank - r2.rank)

    // just the indices of the leading edge
    //leadingEdgeIndices = range(leadingEdgeIndices.length).filter(
    //  i => leadingEdgeIndices[i] === 1
    //)

    const hits = where(isInGeneset, (v) => v > 0)

    const esHits: IRankedGene[] = hits.map((i) => ({
      rank: i,
      name: this._es[i]!.name,
      score: esAll[i]!,
    }))

    const esAllHits: IRankedGene[] = esAll.map((score, i) => ({
      rank: i,
      name: this._es[i]!.name,
      score,
    }))

    return {
      es,

      esHits, //: isInGeneset,
      esAll: esAllHits,

      //leadingEdgeIndices,
      leadingEdge,
    }
  }
}
