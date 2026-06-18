import type { IDBEntity } from '@/interfaces/db-entity'
import { abs } from '../math/abs'
import { mean } from '../math/mean'
import { fisherYatesShuffle } from '../math/random'
import type { IGeneSet, IRankedGene } from './geneset'

interface EnrichmentResult {
  es: number
  leadingEdge: IRankedGene[]
}

function calculateEnrichmentScore(
  rankedGenes: IRankedGene[],
  geneSet: IGeneSet,
  p: number
): EnrichmentResult {
  const N = rankedGenes.length
  const Nh = rankedGenes.filter(g => geneSet.genes.includes(g.name)).length

  if (Nh === 0 || Nh === N) {
    return { es: 0, leadingEdge: [] }
  }

  let NR = 0
  for (let i = 0; i < N; i++) {
    if (geneSet.genes.includes(rankedGenes[i]!.name)) {
      NR += Math.abs(rankedGenes[i]!.score) ** p
    }
  }

  if (NR === 0) {
    return { es: 0, leadingEdge: [] }
  }

  const missStep = 1 / (N - Nh)

  let runningES = 0
  let maxES = 0
  let minES = 0
  let maxESIndex = -1
  let minESIndex = -1

  for (let i = 0; i < N; i++) {
    const gene = rankedGenes[i]!.name
    const score = rankedGenes[i]!.score

    if (geneSet.genes.includes(gene)) {
      runningES += Math.abs(score) ** p / NR
    } else {
      runningES -= missStep
    }

    if (runningES > maxES) {
      maxES = runningES
      maxESIndex = i
    }

    if (runningES < minES) {
      minES = runningES
      minESIndex = i
    }
  }

  const isPositive = Math.abs(maxES) >= Math.abs(minES)
  const ES = isPositive ? maxES : minES

  const leadingEdge = isPositive
    ? rankedGenes
        .slice(0, maxESIndex + 1)
        .filter(g => geneSet.genes.includes(g.name))
    : rankedGenes.slice(minESIndex).filter(g => geneSet.genes.includes(g.name))

  return { es: ES, leadingEdge }
}

// Shuffle only gene names, keeping rank positions and scores fixed.
// Gene set membership is determined by name, so reassigning names
// creates a random gene set of the same size Nh.
function permuteES(
  rankedGenes: IRankedGene[],
  geneSet: IGeneSet,
  p: number
): number {
  const shuffledNames = fisherYatesShuffle(rankedGenes.map(g => g.name))
  const permuted = rankedGenes.map((g, i) => ({
    ...g,
    name: shuffledNames[i]!,
  }))
  return calculateEnrichmentScore(permuted, geneSet, p).es
}

function normalizeES(es: number, posMean: number, negMean: number): number {
  if (es >= 0) {
    return posMean === 0 ? 0 : es / posMean
  } else {
    return negMean === 0 ? 0 : es / negMean
  }
}

export interface FDRResult extends IDBEntity {
  es: number
  nes: number
  pvalue: number
  fdr: number
  leadingEdge: IRankedGene[]
}

export interface GseaOptions {
  p?: number
  numPermutations?: number
}

export function gsea(
  rankedGenes: IRankedGene[],
  geneSets: IGeneSet[],
  opts: GseaOptions = {}
): FDRResult[] {
  const { p = 1, numPermutations = 1000 } = opts

  // Step 1: Observed ES + leading edge per gene set
  const observed = geneSets.map(gs => ({
    gs,
    result: calculateEnrichmentScore(rankedGenes, gs, p),
  }))

  // Step 2: Null ES distribution per gene set via label permutation
  const nullESPerGeneSet: number[][] = observed.map(({ gs }) =>
    Array.from({ length: numPermutations }, () => permuteES(rankedGenes, gs, p))
  )

  // Step 3: Normalization factors from null distribution per gene set
  const normFactors = nullESPerGeneSet.map(nullES => {
    const pos = nullES.filter(x => x > 0)
    const neg = nullES.filter(x => x < 0)
    const posMean = pos.length > 0 ? mean(pos) : 0
    const negMean = neg.length > 0 ? mean(abs(neg)) : 0
    return { posMean, negMean }
  })

  // Step 4: Observed NES, null NES distribution, and p-value per gene set
  const perGeneSet = observed.map(({ gs, result }, i) => {
    const { posMean, negMean } = normFactors[i]!
    const nullES = nullESPerGeneSet[i]!

    const nes = normalizeES(result.es, posMean, negMean)
    const nullNES = nullES.map(es => normalizeES(es, posMean, negMean))
    const absEs = Math.abs(result.es)
    const pvalue =
      (nullES.filter(es => Math.abs(es) >= absEs).length + 1) /
      (numPermutations + 1)

    return { gs, result, nes, nullNES, pvalue }
  })

  // Step 5: Pool null NES across all gene sets for FDR
  const allPosNullNES = perGeneSet.flatMap(s => s.nullNES.filter(x => x >= 0))
  const allNegNullNES = perGeneSet.flatMap(s => s.nullNES.filter(x => x < 0))

  const posObsTotal = perGeneSet.filter(s => s.nes >= 0).length
  const negObsTotal = perGeneSet.filter(s => s.nes < 0).length

  // Step 6: FDR = fraction of null NES as extreme as NES* / fraction of observed NES as extreme as NES*
  // Both fractions are within the same sign subgroup (Subramanian et al. 2005)
  const fdr = perGeneSet.map(({ gs, result, nes, pvalue }) => {
    const isPositive = nes >= 0
    const nullNES = isPositive ? allPosNullNES : allNegNullNES
    const obsTotal = isPositive ? posObsTotal : negObsTotal
    const obsExtreme = (
      isPositive
        ? perGeneSet.filter(s => s.nes >= nes)
        : perGeneSet.filter(s => s.nes <= nes)
    ).length

    const nullExtreme = (
      isPositive ? nullNES.filter(x => x >= nes) : nullNES.filter(x => x <= nes)
    ).length

    let fdr = 1

    if (nullNES.length > 0 && obsTotal > 0 && obsExtreme > 0) {
      const fNull = nullExtreme / nullNES.length
      const fObs = obsExtreme / obsTotal

      fdr = Math.min(1, fNull / fObs)
    }

    return {
      ...result,
      id: gs.id,
      name: gs.name,
      nes,
      pvalue,
      fdr,
    }
  })

  return fdr
}
