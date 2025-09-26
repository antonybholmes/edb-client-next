import { SITE_NAME, SITE_URL } from '@/consts'
import { Metadata } from 'next'
import { IModuleInfo } from './module-info'

export function makeMetaData(
  title: string,
  description: string = ''
): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`
  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description: description || title,
    openGraph: {
      title: fullTitle,
      description: description || title,
    },
  }
}

export function makeMetaDataFromModule(module: IModuleInfo): Metadata {
  const fullTitle = `${module.name} | ${SITE_NAME}`
  return {
    metadataBase: new URL(SITE_URL),
    title: fullTitle,
    description: module.description || module.name,
    openGraph: {
      title: fullTitle,
      description: module.description || module.name,
    },
  }
}
