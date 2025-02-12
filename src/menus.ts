export interface IHeaderModule {
  name: string
  abbr?: string
  description: string
  slug: string
  mode: string
  color?: string
}

export interface IHeaderLink {
  name: string
  modules: IHeaderModule[]
}

export const HEADER_LINKS: IHeaderLink[] = [
  {
    name: 'Plot',
    modules: [
      {
        name: 'Matcalc',
        description: 'Plot heatmaps',
        slug: '/module/matcalc',
        mode: 'prod',
        color: 'cornflowerblue',
      },
      {
        name: 'Oncoplot',
        description: 'Make oncoplots',
        slug: '/module/oncoplot',
        mode: 'dev',
        color: 'orange',
      },
      {
        name: 'Lollipop',
        description: 'Make lollipop plots',
        slug: '/module/lollipop',
        mode: 'dev',
        color: 'orchid',
      },
      {
        name: 'Venn',
        description: 'Make Venn diagrams',
        slug: '/module/venn',
        mode: 'dev',
        color: 'darkblue',
      },
      {
        name: 'UMAP',
        description: 'Plot umaps',
        slug: '/module/umap',
        mode: 'dev',
      },
    ],
  },
  {
    name: 'Expression',
    modules: [
      {
        name: 'Gene Expression',
        abbr: 'Gx',
        description: 'Download expression data',
        slug: '/module/gex',
        mode: 'prod',
      },
    ],
  },
  {
    name: 'Genes',
    modules: [
      {
        name: 'Pathway',
        description: 'Look for pathway enrichment',
        slug: '/module/gene/pathway',
        mode: 'prod',
        color: 'mediumaquamarine',
      },
      {
        name: 'Motifs',
        description: 'Generate gene motif plots',
        slug: '/module/gene/motifs',
        mode: 'prod',
      },
      {
        name: 'Gene Convert',
        description: 'Convert gene symbols between species',
        slug: '/module/gene/convert',
        mode: 'prod',
        color: 'lightseagreen',
      },
      {
        name: 'GSEA',
        description: 'Format GSEA output for figures',
        slug: '/module/gene/gsea',
        mode: 'prod',
        color: 'royalblue',
      },
    ],
  },
  {
    name: 'Genomic',
    modules: [
      {
        name: 'Annotate',
        description: 'Add gene information to locations',
        slug: '/module/genomic/annotate',
        mode: 'prod',
        color: 'salmon',
      },
      {
        name: 'Overlap',
        description: 'Overlap genomic regions',
        slug: '/module/genomic/overlap',
        mode: 'dev',
        color: 'teal',
      },
      {
        name: 'DNA',
        description: 'Get DNA sequences for genomic locations',
        slug: '/module/genomic/dna',
        mode: 'prod',
        color: 'orangered',
      },
      {
        name: 'Rev Comp',
        description: 'Reverse complement DNA sequences',
        slug: '/module/genomic/rev-comp',
        mode: 'prod',
      },
      {
        name: 'Fasta View',
        description: 'Display genomic sequences',
        slug: '/module/genomic/fasta-view',
        mode: 'dev',
      },
      {
        name: 'Seq Browser',
        description: 'Display next gen sequence data',
        slug: '/module/genomic/seqbrowser',
        mode: 'prod',
      },
    ],
  },
  {
    name: 'WGS',
    modules: [
      {
        name: 'Mutations',
        description: 'Explore mutation data',
        slug: '/module/wgs/mutations',
        mode: 'prod',
        color: 'salmon',
      },
    ],
  },
]

export const FOOTER_LINKS = [
  {
    title: 'Start Here',
    links: [
      {
        name: 'Blog',
        url: '/blog',
      },
      {
        name: 'Portfolios',
        url: '/portfolios',
      },
      {
        name: 'Calculators',
        url: '/calculators',
      },
    ],
  },
  {
    title: 'Community',
    links: [
      {
        name: 'Contact Us',
        url: '/contact',
      },
      {
        name: 'FAQ',
        url: '/faq',
      },
    ],
  },
]

export const INFO_LINKS = [
  {
    name: 'Terms',
    url: '/terms',
  },
  {
    name: 'Privacy',
    url: '/privacy',
  },
  {
    name: 'Site Map',
    url: '/sitemap',
  },
]
