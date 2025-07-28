import { SITE_NAME, SITE_URL } from '@/consts'
import { Metadata } from 'next'
import { IModuleInfo } from './module-info'

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

export function makeMetaDataFromModule(module: IModuleInfo): Metadata {
  const title = `${module.name} - ${SITE_NAME}`
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description: module.description || title,
    openGraph: {
      title,
      description: module.description || title,
    },
  }
}
