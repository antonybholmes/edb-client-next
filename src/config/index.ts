import type { IAppInfo } from '@/lib/app-info'
import manifest from './manifest.json'

type Config = {
  appId: string
  domain: string
  url: string
  description: string
  email: string
  author: {
    name: string
    url: string
    email: string
    github: string
  }
} & IAppInfo

export const config: Config = {
  ...(manifest as IAppInfo),
  name: 'Experiments',
  appId: 'edb',
  domain: 'edb.rdf-lab.org',
  url: 'https://edb.rdf-lab.org',
  description: 'Data science tools',
  email: 'hello@antonyholmes.dev',

  author: {
    name: 'Antony Holmes',
    url: 'https://www.antonyholmes.dev',
    email: 'hello@antonyholmes.dev',
    github: 'https://github.com/antonybholmes',
  },
}
