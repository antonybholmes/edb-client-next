import { SITE_NAME, SITE_URL } from '@/consts'
import { Metadata } from 'next'

export function makeMetaData(title: string): Metadata {
  title = `${title} - ${SITE_NAME}`
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: title,
    openGraph: {
      title,
      description: title,
    },
  }
}