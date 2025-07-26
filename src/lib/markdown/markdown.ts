import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'

const POSTS_DIRECTORY = path.join(process.cwd(), 'content', 'posts')

export async function loadMarkdownFile(filePath: string): Promise<{
  contentHtml: string
  [key: string]: any
}> {
  const fullPath = path.join(process.cwd(), filePath)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const { content, data } = matter(fileContents)

  const processedContent = await remark().use(html).process(content)
  const contentHtml = processedContent.toString()

  return {
    contentHtml,
    ...data,
  }
}

export async function getPostData(id: string): Promise<{
  id: string
  contentHtml: string
  [key: string]: any
}> {
  const fullPath = path.join(POSTS_DIRECTORY, `${id}.md`)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const matterResult = matter(fileContents)

  const processedContent = await remark()
    .use(html)
    .process(matterResult.content)
  const contentHtml = processedContent.toString()

  return {
    id,
    contentHtml,
    ...matterResult.data,
  }
}
