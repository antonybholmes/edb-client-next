import GENE_CONVERT_MODULE from './components/pages/apps/genes/gene-convert/manifest.json'
import GSEA_PLOT_MODULE from './components/pages/apps/genes/gsea-plot/manifest.json'
import GSEA_WEB_MODULE from './components/pages/apps/genes/gsea-web/manifest.json'
import MOTIFS_MODULE from './components/pages/apps/genes/motifs/manifest.json'
import PATHWAY_MODULE from './components/pages/apps/genes/pathway/manifest.json'
import ANNOTATE_MODULE from './components/pages/apps/genomic/annotate/manifest.json'
import DNA_MODULE from './components/pages/apps/genomic/dna/manifest.json'
import OVERLAP_MODULE from './components/pages/apps/genomic/overlap/manifest.json'
import REV_COMP_MODULE from './components/pages/apps/genomic/rev-comp/manifest.json'
import SEQBROWSER_MODULE from './components/pages/apps/genomic/seq-browser/manifest.json'
import HUBS_MODULE from './components/pages/apps/hubs/manifest.json'
import MATCALC_MODULE from './components/pages/apps/matcalc/manifest.json'
import SINGLE_CELL_MODULE from './components/pages/apps/ngs/single-cell/manifest.json'
import VENN_MODULE from './components/pages/apps/venn/manifest.json'
import LOLLIPOP_MODULE from './components/pages/apps/wgs/lollipop/manifest.json'
import ONCOPLOT_MODULE from './components/pages/apps/wgs/oncoplot/manifest.json'
import VARIANTS_MODULE from './components/pages/apps/wgs/variants/manifest.json'

export interface IAppHeaderLink {
  name: string
  abbr?: string
  description: string
  slug?: string
  mode?: string
  color?: string
}

export interface IHeaderLink {
  name: string
  apps: IAppHeaderLink[]
}

export const HEADER_LINKS: IHeaderLink[] = [
  {
    name: 'Plot',
    apps: [
      {
        ...MATCALC_MODULE,
        slug: '/apps/matcalc',
        mode: 'prod',
      },
      {
        name: 'Bio Draw',
        description: 'Draw biological diagrams.',
        slug: '/apps/bio-draw',
        mode: 'dev',
        color: '#6495ED',
      },
      {
        ...ONCOPLOT_MODULE,
        slug: '/apps/wgs/oncoplot',
        mode: 'prod',
      },
      {
        ...LOLLIPOP_MODULE,
        slug: '/apps/wgs/lollipop',
        mode: 'prod',
      },
      {
        ...VENN_MODULE,
        slug: '/apps/venn',
        mode: 'prod',
      },
      {
        ...SINGLE_CELL_MODULE,
        slug: '/apps/ngs/single-cell',
        mode: 'prod',
      },
    ],
  },

  {
    name: 'Genes',
    apps: [
      {
        ...PATHWAY_MODULE,
        slug: '/apps/genes/pathway',
        mode: 'prod',
      },
      {
        ...MOTIFS_MODULE,
        slug: '/apps/genes/motifs',
        mode: 'prod',
      },
      {
        ...GENE_CONVERT_MODULE,
        slug: '/apps/genes/convert',
        mode: 'prod',
      },
      {
        ...GSEA_WEB_MODULE,
        slug: '/apps/genes/gsea-web',
        mode: 'dev',
      },
      {
        ...GSEA_PLOT_MODULE,
        slug: '/apps/genes/gsea-plot',
        mode: 'prod',
      },
    ],
  },
  {
    name: 'Genomic',
    apps: [
      {
        ...ANNOTATE_MODULE,
        slug: '/apps/genomic/annotate',
        mode: 'prod',
      },
      {
        ...OVERLAP_MODULE,
        slug: '/apps/genomic/overlap',
        mode: 'dev',
      },
      {
        ...DNA_MODULE,
        slug: '/apps/genomic/dna',
        mode: 'prod',
      },
      {
        ...REV_COMP_MODULE,
        slug: '/apps/genomic/rev-comp',
        mode: 'prod',
      },
      {
        ...HUBS_MODULE,
        slug: '/apps/hubs',
        mode: 'prod',
      },
      // {
      //   name: 'Fasta View',
      //   description: 'Display genomic sequences',
      //   slug: '/apps/genomic/fasta-view',
      //   mode: 'dev',
      // },
      {
        ...SEQBROWSER_MODULE,
        slug: '/apps/genomic/seq-browser',
        mode: 'prod',
      },
    ],
  },
  {
    name: 'WGS',
    apps: [
      {
        ...VARIANTS_MODULE,
        slug: '/apps/wgs/variants',
        mode: 'prod',
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
