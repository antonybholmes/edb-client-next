import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  //output: 'export',
  async redirects() {
    return [
      {
        source: '/module/:path*',
        destination: '/apps/:path*',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
