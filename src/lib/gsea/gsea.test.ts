vi.mock('../math/shuffle', () => ({
  fisherYatesShuffle: <T>(arr: T[]) => [...arr],
}))

import type { IGeneSet, IRankedGene } from './geneset'
import { gsea } from './gsea'

const rankedGenes: IRankedGene[] = [
  { name: 'A', score: 4, rank: 1 },
  { name: 'B', score: 3, rank: 2 },
  { name: 'C', score: 2, rank: 3 },
  { name: 'D', score: 1, rank: 4 },
]

describe('gsea', () => {
  it('returns the expected score and leading edge for a top-enriched gene set', () => {
    const geneSets: IGeneSet[] = [
      {
        id: 'gs-top',
        name: 'Top hits',
        genes: ['A', 'B'],
        color: '#000000',
      },
    ]

    const [result] = gsea(rankedGenes, geneSets, { numPermutations: 3 })

    expect(result).toBeDefined()
    expect(result!.id).toBe('gs-top')
    expect(result!.es).toBeCloseTo(1)
    expect(result!.nes).toBeCloseTo(1)
    expect(result!.pvalue).toBe(1)
    expect(result!.fdr).toBe(1)
    expect(result!.leadingEdge).toEqual(['A', 'B'])
  })

  it('returns zero enrichment for a gene set with no overlap', () => {
    const geneSets: IGeneSet[] = [
      {
        id: 'gs-miss',
        name: 'No overlap',
        genes: ['X', 'Y'],
        color: '#000000',
      },
    ]

    const [result] = gsea(rankedGenes, geneSets, { numPermutations: 3 })

    expect(result).toBeDefined()
    expect(result!.id).toBe('gs-miss')
    expect(result!.es).toBe(0)
    expect(result!.nes).toBe(0)
    expect(result!.pvalue).toBe(1)
    expect(result!.fdr).toBe(1)
    expect(result!.leadingEdge).toEqual([])
  })
})
