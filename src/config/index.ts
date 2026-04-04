type Config = {
  appName: string
  appId: string
  domain: string
  description: string
  email: string
  url: string
  author: {
    name: string
    url: string
    email: string
    github: string
  }
}

export const config: Config = {
  appName: 'Experiments',
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
