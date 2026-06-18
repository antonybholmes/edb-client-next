import { config } from '@/config'
import { Metadata } from 'next'
import { IAppInfo } from './app-info'

export function makeMetaData(
  title: string,
  description: string = ''
): Metadata {
  const fullTitle = `${title} | ${config.name}`

  console.log(config)

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

export function makeMetaDataFromModule(module: IAppInfo): Metadata {
  const fullTitle = `${module.name} | ${config.name}`
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
