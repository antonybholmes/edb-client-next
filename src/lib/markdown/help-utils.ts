export type ITopicMap = { [key: string]: ITopicMap }

export type ITopicTree = {
  title: string
  description: string

  weight: number
  path: string[]
  slug: string
  children: ITopicTree[]
}
