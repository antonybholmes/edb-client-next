import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  //output: 'export',
  async redirects() {
    return [
      {
        source: '/module',
        destination: '/apps',
        permanent: true,
      },
      {
        source: '/module/matcalc',
        destination: '/apps/matcalc',
        permanent: true,
      },
      {
        source: '/module/gex',
        destination: '/apps/gex',
        permanent: true,
      },
      {
        source: '/module/venn',
        destination: '/apps/venn',
        permanent: true,
      },
      {
        source: '/module/genes/motifs',
        destination: '/apps/gene/motifs',
        permanent: true,
      },
      {
        source: '/module/genes/pathway',
        destination: '/apps/gene/pathway',
        permanent: true,
      },
      {
        source: '/module/genes/gsea',
        destination: '/apps/gene/gsea',
        permanent: true,
      },
      {
        source: '/module/genomic/seqbrowser',
        destination: '/apps/genomic/seqbrowser',
        permanent: true,
      },
      {
        source: '/module/genomic/dna',
        destination: '/apps/genomic/dna',
        permanent: true,
      },
      {
        source: '/module/genomic/rev-comp',
        destination: '/apps/genomic/rev-comp',
        permanent: true,
      },
      {
        source: '/module/genomic/overlap',
        destination: '/apps/genomic/overlap',
        permanent: true,
      },
      {
        source: '/module/genomic/annotate',
        destination: '/apps/genomic/annotate',
        permanent: true,
      },
      {
        source: '/module/wgs/mutations',
        destination: '/apps/wgs/mutations',
        permanent: true,
      },
      {
        source: '/account/signin',
        destination: '/account/auth/oauth2/signin',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
