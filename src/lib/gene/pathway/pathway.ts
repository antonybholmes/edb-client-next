import type { SeriesData } from '@/lib/dataframe/series-data'
import { intersect1d } from '../../collections'

import type { ICollection, IGeneSet } from '../../gsea/geneset'
import { argsort } from '../../math/argsort'

import { Hypergeometric } from '../../math/hypgeometric'
import { range } from '../../math/range'
import { sum } from '../../math/sum'

export const GENES_IN_UNIVERSE = 42577 //45956

// export const PATHWAY_TABLE_COLS = [
//   "Geneset",
//   "Dataset",
//   "Pathway",
//   "# Genes in Gene Set (K)",
//   "# Genes in Comparison (n)",
//   "# Genes in overlap (k)",
//   "# Genes in Universe",
//   "# Gene Sets",
//   "p",
//   "q",
//   "-log10q",
//   "rank",
//   "Ratio k/n",
//   "Genes in overlap",
// ]

export const PATHWAY_TABLE_COLS = [
  'Geneset',
  'Dataset',
  'Pathway',
  'Genes in Gene Set',
  '# Genes in Gene Set (K)',
  '# Genes in Comparison (n)',
  '# Genes in overlap (k)',
  '# Genes in Universe',
  'p',
  'q',
  '-log10q',
  'Ratio k/K',
  'Genes',
]

export interface IGeneSetFile {
  name: string
  url: string
}

// export interface IPathway extends IGeneset {
//   //organization: string
//   dataset: string
// }

// export interface IGeneSetCollection {
//   name: string
//   genesets: IGeneSet[]
// }

export class PathwayOverlap {
  _collections: ICollection[]
  _gene_map: Map<string, Set<string>>
  _source_map: Map<string, Map<string, string>>
  _npathways: number
  _N_genes: number
  _show_gene_pathway_table: boolean

  constructor(n_genes = GENES_IN_UNIVERSE, show_gene_pathway_table = false) {
    this._collections = []
    this._gene_map = new Map<string, Set<string>>()
    this._source_map = new Map<string, Map<string, string>>()
    this._npathways = -1
    this._N_genes = n_genes
    this._show_gene_pathway_table = show_gene_pathway_table
  }

  addDataset(collection: ICollection) {
    this._collections.push(collection)
    this._npathways = -1
  }

  get pathways(): number {
    if (this._npathways === -1) {
      this._npathways = sum(this._collections.map((gcs) => gcs.genesets.length))
    }

    return this._npathways
  }

  test(genesets: IGeneSet[]): [SeriesData[][], string[]] {
    let allData: SeriesData[][] = []

    genesets.forEach((geneset) => {
      const genes = new Set<string>(geneset.genes)
      const K = genes.size
      let c = 0
      const data: SeriesData[][] = []

      this._collections.forEach((collection) => {
        collection.genesets.forEach((pathway, pi) => {
          const pathwayGenes = new Set<string>(pathway.genes)

          const n = pathwayGenes.size

          const overlappingGenes = intersect1d(genes, pathwayGenes)

          const k = overlappingGenes.size

          const dist = new Hypergeometric(this._N_genes, K, n)

          let p = k > 0 ? 1 - dist.cdf(k - 1) : 1

          p = Math.max(0, Math.min(p))

          // "Geneset",
          // "Dataset",
          // "Pathway",
          // "Genes in Gene Set",
          // "# Genes in Gene Set (K)",
          // "# Genes in Comparison (n)",
          // "# Genes in overlap (k)",
          // "# Genes in Universe",
          // "p",
          // "q",
          //"-log10q",
          // "Ratio k/n",
          // "Genes",

          data.push([
            geneset.name,
            collection.name,
            pathway.name,
            pi === 0 ? [...genes].sort().join(',') : '',
            K,
            n,
            k,
            this._N_genes,
            //npathways,
            p,
            0,
            0,
            k / K,
            [...overlappingGenes].sort().join(';'),
          ])

          c += 1
        })
      })

      //
      // fdr
      //

      const pvalues: number[] = data.map((row) => row[8] as number)
      const idx = argsort(pvalues)

      const i0: number = idx[0]!

      const q = pvalues[i0]! * data.length //this.pathways()

      data[i0]![9] = Math.min(1, Math.max(0, q))
      //data[idx[0]][12] = 1

      range(1, c).forEach((i) => {
        const rank = i + 1
        const q = (pvalues[idx[i]!]! * data.length) / rank
        data[idx[i]!]![9] = Math.min(
          1,
          Math.max(0, Math.max(data[idx[i - 1]!]![9] as number, q))
        )

        //data[idx[i]][12] = rank
      })

      range(data.length).forEach((i) => {
        // log10 of q
        data[i]![10] = -Math.log10(<number>data[i]![9])
      })

      allData = allData.concat(data)
    })

    return [allData, PATHWAY_TABLE_COLS]
  }
}
