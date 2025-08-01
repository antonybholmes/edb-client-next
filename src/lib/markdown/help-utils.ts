export type ITopicMap = { [key: string]: ITopicMap }

export type ITopicTree = {
  title: string
  description: string

  weight: number
  path: string[]
  slug: string
  children: ITopicTree[]
}

export type HelpNode = {
  type: 'file' | 'dir'
  slug: string[]
  title: string
  description: string
  fullPath?: string // For files, not directories
  children?: HelpNode[]
}
