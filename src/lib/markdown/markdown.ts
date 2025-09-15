import { IFieldMap } from '@/interfaces/field-map'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import { remark } from 'remark'
import remarkRehype from 'remark-rehype'

//const POSTS_DIRECTORY = path.join(process.cwd(), 'content', 'posts')

export interface IPostData {
  id: string
  contentHtml: string
  data: IFieldMap
}

export async function loadMarkdownFile(
  id: string,
  fullPath: string
): Promise<IPostData> {
  //const fullPath = path.join(process.cwd(), filePath)
  const fileContents = fs.readFileSync(fullPath, 'utf8')

  const { content, data } = matter(fileContents)

  // const processedContent = await remark()
  //   .use(remarkRehype)
  //   .use(rehypeSlug)
  //   .use(rehypeStringify)
  //   .process(content)

  const result = await remark()
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'wrap',
    })
    .use(rehypeStringify)
    .process(content)

  const contentHtml = result.toString()

  return {
    id,
    contentHtml,
    data,
  }
}

// export async function getPostData(id: string): Promise<{
//   id: string
//   contentHtml: string
//   [key: string]: any
// }> {
//   const fullPath = path.join(POSTS_DIRECTORY, `${id}.md`)
//   const fileContents = fs.readFileSync(fullPath, 'utf8')

//   const matterResult = matter(fileContents)

//   const processedContent = await remark()
//     .use(remarkRehype)
//     .use(rehypeSlug)
//     .use(rehypeStringify)
//     .process(matterResult.content)
//   const contentHtml = processedContent.toString()

//   return {
//     id,
//     contentHtml,
//     ...matterResult.data,
//   }
// }

// Recursively get all markdown files in a directory
export function getAllMarkdownFiles(
  dir: string,
  fileList: string[] = []
): string[] {
  const files = fs.readdirSync(dir)

  files.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      getAllMarkdownFiles(fullPath, fileList)
    } else if (file.endsWith('.md') || file.endsWith('.mdx')) {
      fileList.push(fullPath)
    }
  })

  return fileList
}
