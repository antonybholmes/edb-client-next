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
        description: 'Gene expression and heatmaps.',
        slug: '/apps/matcalc',
        mode: 'prod',
        color: '#6495ED',
      },
      {
        name: 'Bio Draw',
        description: 'Draw biological diagrams.',
        slug: '/apps/bio-draw',
        mode: 'dev',
        color: '#6495ED',
      },
      {
        name: 'Oncoplot',
        description: 'Make oncoplots.',
        slug: '/apps/wgs/oncoplot',
        mode: 'prod',
        color: '#FFA500',
      },
      {
        name: 'Lollipop',
        description: 'Lollipop plots.',
        slug: '/apps/wgs/lollipop',
        mode: 'prod',
        color: '#DA70D6',
      },
      {
        name: 'Venn',
        description: 'Venn diagrams.',
        slug: '/apps/venn',
        mode: 'prod',
        color: '#00008B',
      },
      {
        name: 'Single Cell',
        description: 'Plot single cell data.',
        slug: '/apps/ngs/single-cell',
        mode: 'prod',
        color: '#9966ff',
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
        description: 'Pathway enrichment tests.',
        slug: '/apps/genes/pathway',
        mode: 'prod',
        color: '#66CDAA',
      },
      {
        name: 'Motifs',
        description: 'Gene motif plots.',
        slug: '/apps/genes/motifs',
        mode: 'prod',
        color: '#009933',
      },
      {
        name: 'Gene Convert',
        description: 'Convert genes between species.',
        slug: '/apps/genes/convert',
        mode: 'prod',
        color: '#20B2AA',
      },
      {
        name: 'GSEA',
        description: 'Format GSEA figures.',
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
        description: 'Gene information for locations.',
        slug: '/apps/genomic/annotate',
        mode: 'dev',
        color: '#FA8072',
      },
      {
        name: 'Overlap',
        description: 'Overlap genomic regions.',
        slug: '/apps/genomic/overlap',
        mode: 'dev',
        color: '#008080',
      },
      {
        name: 'DNA',
        description: 'DNA sequences.',
        slug: '/apps/genomic/dna',
        mode: 'prod',
        color: '#FF4500',
      },
      {
        name: 'Rev Comp',
        description: 'Reverse complement DNA.',
        slug: '/apps/genomic/rev-comp',
        mode: 'prod',
      },
      {
        name: 'Hubs',
        description: 'Links for UCSC hubs.',
        slug: '/apps/hubs',
        mode: 'prod',
        color: '#0000ff',
      },
      // {
      //   name: 'Fasta View',
      //   description: 'Display genomic sequences',
      //   slug: '/apps/genomic/fasta-view',
      //   mode: 'dev',
      // },
      {
        name: 'Seq Browser',
        description: 'Next gen sequence data plots.',
        slug: '/apps/genomic/seqbrowser',
        mode: 'prod',
        color: '#FF0000',
      },
    ],
  },
  {
    name: 'WGS',
    modules: [
      {
        name: 'Variants',
        description: 'Explore mutation data.',
        slug: '/apps/wgs/variants',
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
