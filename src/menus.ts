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
        slug: '/apps/matcalc',
        mode: 'prod',
        color: '#6495ED',
      },
      {
        name: 'Bio Draw',
        description: 'Draw biological diagrams',
        slug: '/apps/bio-draw',
        mode: 'dev',
        color: '#6495ED',
      },
      {
        name: 'Oncoplot',
        description: 'Make oncoplots',
        slug: '/apps/oncoplot',
        mode: 'dev',
        color: '#FFA500',
      },
      {
        name: 'Lollipop',
        description: 'Make lollipop plots',
        slug: '/apps/lollipop',
        mode: 'prod',
        color: '#DA70D6',
      },
      {
        name: 'Venn',
        description: 'Make Venn diagrams',
        slug: '/apps/venn',
        mode: 'dev',
        color: '#00008B',
      },
      {
        name: 'Single Cell',
        description: 'Single Cell Analysis',
        slug: '/apps/single-cell',
        mode: 'dev',
      },
    ],
  },
  // {
  //   name: 'Expression',
  //   modules: [
  //     {
  //       name: 'Gene Expression',
  //       abbr: 'Gx',
  //       description: 'Download expression data',
  //       slug: '/apps/gex',
  //       mode: 'dev',
  //     },
  //   ],
  // },
  {
    name: 'Genes',
    modules: [
      {
        name: 'Pathway',
        description: 'Look for pathway enrichment',
        slug: '/apps/genes/pathway',
        mode: 'prod',
        color: '#66CDAA',
      },
      {
        name: 'Motifs',
        description: 'Generate gene motif plots',
        slug: '/apps/genes/motifs',
        mode: 'prod',
      },
      {
        name: 'Gene Convert',
        description: 'Convert gene symbols between species',
        slug: '/apps/genes/convert',
        mode: 'prod',
        color: '#20B2AA',
      },
      {
        name: 'GSEA',
        description: 'Format GSEA output for figures',
        slug: '/apps/genes/gsea',
        mode: 'prod',
        color: '#4169E1',
      },
    ],
  },
  {
    name: 'Genomic',
    modules: [
      {
        name: 'Annotate',
        description: 'Add gene information to locations',
        slug: '/apps/genomic/annotate',
        mode: 'prod',
        color: '#FA8072',
      },
      {
        name: 'Overlap',
        description: 'Overlap genomic regions',
        slug: '/apps/genomic/overlap',
        mode: 'dev',
        color: '#008080',
      },
      {
        name: 'DNA',
        description: 'Get DNA sequences for genomic locations',
        slug: '/apps/genomic/dna',
        mode: 'prod',
        color: '#FF4500',
      },
      {
        name: 'Rev Comp',
        description: 'Reverse complement DNA sequences',
        slug: '/apps/genomic/rev-comp',
        mode: 'prod',
      },
      {
        name: 'Hubs',
        description: 'Links for UCSC hubs',
        slug: '/apps/hubs',
        mode: 'prod',
        color: '#9370DB',
      },
      // {
      //   name: 'Fasta View',
      //   description: 'Display genomic sequences',
      //   slug: '/apps/genomic/fasta-view',
      //   mode: 'dev',
      // },
      {
        name: 'Seq Browser',
        description: 'Display next gen sequence data',
        slug: '/apps/genomic/seqbrowser',
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
        slug: '/apps/wgs/mutations',
        mode: 'prod',
        color: '#FA8072',
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
