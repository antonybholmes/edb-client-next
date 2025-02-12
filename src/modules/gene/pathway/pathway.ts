import { intersect1d } from '../../../lib/collections'
import { type SeriesData } from '../../../lib/dataframe/dataframe-types'
import type { IGeneset } from '../../../lib/gsea/geneset'
import { argsort } from '../../../lib/math/argsort'

import { hypGeomCDF } from '../../../lib/math/hypgeom'
import { range } from '../../../lib/math/range'
import { sum } from '../../../lib/math/sum'

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

export interface IPathway extends IGeneset {
  organization: string
  dataset: string
}

export interface IDataset {
  organization: string
  name: string
  pathways: IPathway[]
}

// export interface IGeneSetCollection {
//   name: string
//   genesets: IGeneSet[]
// }

export class PathwayOverlap {
  _datasets: IDataset[]
  _gene_map: Map<string, Set<string>>
  _source_map: Map<string, Map<string, string>>
  _npathways: number
  _N_genes: number
  _show_gene_pathway_table: boolean

  constructor(n_genes = GENES_IN_UNIVERSE, show_gene_pathway_table = false) {
    this._datasets = []
    this._gene_map = new Map<string, Set<string>>()
    this._source_map = new Map<string, Map<string, string>>()
    this._npathways = -1
    this._N_genes = n_genes
    this._show_gene_pathway_table = show_gene_pathway_table
  }

  addDataset(dataset: IDataset) {
    this._datasets.push(dataset)
    this._npathways = -1
  }

  get pathways(): number {
    console.log(this._datasets)
    if (this._npathways == -1) {
      this._npathways = sum(this._datasets.map((gcs) => gcs.pathways.length))
    }

    return this._npathways
  }

  test(genesets: IGeneset[]): [SeriesData[][], string[]] {
    let allData: SeriesData[][] = []

    genesets.forEach((geneset) => {
      const genes = new Set<string>(geneset.genes)
      const K = genes.size
      let c = 0
      const data: SeriesData[][] = []

      //console.log(tgs.name)

      this._datasets.forEach((dataset) => {
        //console.log(gcs.name)
        dataset.pathways.forEach((pathway, pi) => {
          const pathwayGenes = new Set<string>(pathway.genes)

          const n = pathwayGenes.size

          //console.log(genes)
          //console.log(pathwayGenes)

          const overlappingGenes = intersect1d(genes, pathwayGenes)

          const k = overlappingGenes.size

          let p = k > 0 ? 1 - hypGeomCDF(k - 1, this._N_genes, K, n) : 1

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
          // //"-log10q",
          // "Ratio k/n",
          // "Genes",

          data.push([
            geneset.name,
            dataset.name,
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

      //console.log("plo", data.length, npathways, c)

      const pvalues: number[] = data.map((row) => row[8] as number)
      const idx = argsort(pvalues)

      const i0: number = idx[0]!

      const q = pvalues[i0]! * data.length //this.pathways()

      data[i0]![9] = Math.min(1, Math.max(0, q))
      //data[idx[0]][12] = 1

      //console.log(data)

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

    console.log(allData[0], allData[0]!.length, PATHWAY_TABLE_COLS.length)

    return [allData, PATHWAY_TABLE_COLS]
  }
}
