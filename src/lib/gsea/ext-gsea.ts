import { fill } from '../../lib/fill'
import { abs } from '../../lib/math/abs'
import { sub } from '../../lib/math/add'
import { argsort } from '../../lib/math/argsort'
import { cumsum } from '../../lib/math/cumsum'

import { where } from '../../lib/math/math'
import { mean } from '../../lib/math/mean'
import { div, mult } from '../../lib/math/multiply'
import { ones } from '../../lib/math/ones'
import { pow } from '../../lib/math/power'
import { range } from '../../lib/math/range'
import { zeros } from '../../lib/math/zeros'
import { permutation } from '../math/random'

import {
  EMPTY_GENE_SET,
  type IGeneset,
  type IRankedGene,
  type IRankedGenes,
} from './geneset'

// https://www.mathworks.com/matlabcentral/fileexchange/33599-gsea2

export interface IExtGseaResult {
  es: number
  nes: number
  pvalue: number
  //leadingEdgeIndices,
  leadingEdge: IRankedGene[]
}

export interface IGseaResult {
  es: number
  esAll: number[]
  hits: number[]
  //leadingEdgeIndices,
  leadingEdge: IRankedGene[]
}

export class ExtGSEA {
  private _w: number
  private _np: number
  private _rankedGenes: IRankedGenes

  private _rkc: string[]
  private _rsc: number[]
  private _pn: number[]
  private _es: number
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
  private _gs1: IGeneset
  private _gs2: IGeneset
  //private _rankedScores: number[]

  constructor(
    rankedGenes: IRankedGenes,

    permutations = 1000,
    w = 1
  ) {
    this._w = w
    this._np = permutations
    this._rankedGenes = rankedGenes

    const l = rankedGenes.genes.length

    // the negative versions are for the second gene set
    const names = rankedGenes.genes.map((g) => g.name)
    const scores = rankedGenes.genes.map((g) => g.score)

    const rk = [...names, ...names] //np.concatenate((ranked_gene_list, ranked_gene_list), axis=0)
    const rsc = [...scores, ...scores.map((x) => -x)] //np.concatenate((ranked_scores, -ranked_scores), axis=0)
    //descending order
    const ix = argsort(rsc).reverse()

    const pn = [...ones(l), ...fill(-1, l)] //np.concatenate((np.ones(l), -np.ones(l)), axis=0)

    this._gs1 = { ...EMPTY_GENE_SET }
    this._gs2 = { ...EMPTY_GENE_SET }
    this._rkc = ix.map((i) => rk[i])
    this._rsc = ix.map((i) => rsc[i])
    this._pn = ix.map((i) => pn[i])

    // Defaults if nothing found
    this._es = -1
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

  get rankedGenes(): IRankedGenes {
    return this._rankedGenes
  }

  get gs1(): IGeneset {
    return this._gs1
  }

  get gs2(): IGeneset {
    return this._gs2
  }

  get nes(): number {
    return this._nes
  }

  get p(): number {
    return this._pvalue
  }

  runExtGsea(gs1: IGeneset, gs2: IGeneset): IExtGseaResult {
    this._gs1 = gs1
    this._gs2 = gs2
    //this._gsn1 = gs1.name
    //this._gsn2 = gs2.name

    //const gs1s = new Set<string>(gs1)
    //const gs2s = new Set<string>(gs2)

    //let l = this._rankedGeneList.length

    // this._hits1 = zeros(l)
    // this._hits2 = zeros(l)

    // range(l).forEach(i => {
    //   if (gs1s.has(this._rankedGeneList[i]!)) {
    //     this._hits1[i] = 1
    //   }

    //   if (gs2s.has(this._rankedGeneList[i]!)) {
    //     this._hits2[i] = 1
    //   }
    // })

    const l = this._rkc.length

    // Is ranked gene in gene set
    const isInGeneset = zeros(l)

    const ids1 = new Set(gs1.genes)
    const ids2 = new Set(gs2.genes)

    for (const i of range(l)) {
      if (
        (this._pn[i] > 0 && ids1.has(this._rkc[i])) ||
        (this._pn[i] < 0 && ids2.has(this._rkc[i]))
      ) {
        isInGeneset[i] = 1
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
    const maxEs = Math.max(...this._esAllGenes)
    const minEs = Math.min(...this._esAllGenes)

    //console.log('es all', this._esAllGenes)

    this._es = maxEs + minEs

    const isEnriched = zeros(l)

    if (this._es < 0) {
      const ixpk = where(this._esAllGenes, (x) => x === minEs)[0]!

      for (const i of range(ixpk, isEnriched.length)) {
        isEnriched[i] = 1
      }

      this._leadingEdge = this._rankedGenes.genes
        .filter((_, gi) => isEnriched[gi] === 1 && isInGeneset[gi] === 1)
        .reverse()
    } else {
      const ixpk = where(this._esAllGenes, (x) => x === maxEs)[0]!

      for (const i of range(ixpk + 1)) {
        isEnriched[i] = 1
      }

      this._leadingEdge = this._rankedGenes.genes.filter(
        (_, gi) => isEnriched[gi] === 1 && isInGeneset[gi] === 1
      )
    }

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
        bgEs[i] = Math.max(...bgAll) + Math.min(...bgAll)
      }

      if (this._es < 0) {
        this._pvalue = bgEs.filter((v) => v <= this._es).length / this._np
        this._nes = this._es / Math.abs(mean(bgEs.filter((es) => es < 0)))
      } else {
        this._pvalue = bgEs.filter((v) => v >= this._es).length / this._np
        this._nes = this._es / Math.abs(mean(bgEs.filter((es) => es > 0)))
      }
    }

    return {
      es: this._es,
      nes: this._nes,
      pvalue: this._pvalue,
      leadingEdge: this._leadingEdge,
    }
  }

  runGSEA(gs1: IGeneset): IGseaResult {
    const l = this._rankedGenes.genes.length

    const isInGeneset = zeros(l)

    const ids1 = new Set(gs1.genes)

    for (const [index, gene] of this._rankedGenes.genes.entries()) {
      if (ids1.has(gene.name)) {
        isInGeneset[index] = 1
      }
    }

    const scores = this._rankedGenes.genes.map((g) => g.score)

    // Compute ES
    let scoreHits = cumsum(pow(abs(mult(scores, isInGeneset)), this._w))
    scoreHits = div(scoreHits, scoreHits[scoreHits.length - 1]!)
    let scoreMisses = cumsum(isInGeneset.map((v) => 1 - v))
    scoreMisses = div(scoreMisses, scoreMisses[scoreMisses.length - 1]!)

    const esAll = sub(scoreHits, scoreMisses)
    const maxEs = Math.max(...esAll)
    const minEs = Math.min(...esAll)
    const es = maxEs + minEs

    const leadingEdgeIndices = zeros(l)
    let leadingEdge: IRankedGene[] = []

    if (es < 0) {
      // where does the leading edge start
      const ixpk = where(esAll, (x) => x === minEs)[0]!

      for (const i of range(ixpk, leadingEdgeIndices.length)) {
        leadingEdgeIndices[i] = 1
      }

      leadingEdge = this._rankedGenes.genes
        .filter(
          (_, gi) => leadingEdgeIndices[gi] === 1 && isInGeneset[gi] === 1
        )
        .sort((r1, r2) => r1.rank - r2.rank)
        .reverse()
    } else {
      const ixpk = where(esAll, (x) => x === maxEs)[0]!

      for (const i of range(ixpk + 1)) {
        leadingEdgeIndices[i] = 1
      }

      leadingEdge = this._rankedGenes.genes.filter(
        (_, gi) => leadingEdgeIndices[gi] === 1 && isInGeneset[gi] === 1
      )
    }

    // just the indices of the leading edge
    //leadingEdgeIndices = range(leadingEdgeIndices.length).filter(
    //  i => leadingEdgeIndices[i] === 1
    //)

    return {
      es,
      esAll,
      hits: isInGeneset,
      //leadingEdgeIndices,
      leadingEdge,
    }
  }
}
