export interface IAppInfo {
  name: string
  description: string
  color?: string
  version: string
  build: number
  copyright: string
  modified: string // utc date
  //updated: string // utc date
  hash: string
}

export const NO_APP_INFO: IAppInfo = {
  name: '',
  description: '',

  version: '',
  build: 0,
  copyright: '',
  modified: '',
  //updated: '',
  hash: '',
}

export function getAppName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}
