import type { IGenomicLocation } from './genomic-location'

export type Feature = 'gene' | 'transcript' | 'exon'

export interface IGenomicFeature {
  loc: IGenomicLocation
  type: string // e.g. gene, transcript
  biotype: string // e.g protein coding

  geneId?: string // e.g. ENSG00000139618
  symbol?: string
  transcript?: string // e.g. ENST00000380152
  isCanonical?: boolean
  isLongest?: boolean
  label?: string
  tssDist?: number

  exon?: string // e.g. ENSE00003695731
  exonNumber?: number
  //children?: IGenomicFeature[]
  //transcripts?: IGenomicFeature[]
  children?: IGenomicFeature[] // for exons, utrs cds etc
  //exons?: IGenomicFeature[]
  //cds?: IGenomicFeature[]
  //utrs?: IGenomicFeature[]
}
