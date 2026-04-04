import { config } from '@/config'
import { Metadata } from 'next'
import { IModuleInfo } from './module-info'

export function makeMetaData(
  title: string,
  description: string = ''
): Metadata {
  const fullTitle = `${title} | ${config.appName}`
  return {
    metadataBase: new URL(config.url),
    title: fullTitle,
    description: description || title,
    openGraph: {
      title: fullTitle,
      description: description || title,
    },
  }
}

export function makeMetaDataFromModule(module: IModuleInfo): Metadata {
  const fullTitle = `${module.name} | ${config.appName}`
  return {
    metadataBase: new URL(config.url),
    title: fullTitle,
    description: module.description || module.name,
    openGraph: {
      title: fullTitle,
      description: module.description || module.name,
    },
  }
}
