import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'
import readingTime from 'reading-time'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

export type Frontmatter = {
  title: string
  date: string
  description?: string
  tags?: string[]
}

export type PostMeta = Frontmatter & {
  slug: string
  readingTime: string
}

export type Post = {
  slug: string
  frontmatter: Frontmatter
  content: string
  readingTime: string
}

const postsDir = path.join(process.cwd(), 'content', 'posts')

// 🔥 Shiki config (Astro-like)
const prettyCodeOptions = {
  theme: 'github-dark',
  keepBackground: true,

  onVisitLine(node: any) {
    // ensures empty lines still render properly
    if (node.children.length === 0) {
      node.children = [{ type: 'text', value: ' ' }]
    }
  },

  onVisitHighlightedLine(node: any) {
    node.properties.className.push('line--highlighted')
  },

  onVisitHighlightedWord(node: any) {
    node.properties.className = ['word--highlighted']
  },
}

// 📚 Get all posts (for index page)
export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(postsDir)

  const posts: PostMeta[] = files.map((file) => {
    const slug = file.replace(/\.md$/, '')
    const fileContent = fs.readFileSync(path.join(postsDir, file), 'utf8')

    const { data, content } = matter(fileContent)
    const stats = readingTime(content)

    return {
      slug,
      ...(data as Frontmatter),
      readingTime: stats.text,
    }
  })

  // 🗂️ Sort by date (newest first)
  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

// 📄 Get single post
export async function getPostBySlug(slug: string): Promise<Post> {
  const filePath = path.join(postsDir, `${slug}.md`)

  const fileContent = fs.readFileSync(filePath, 'utf8')

  const { data, content } = matter(fileContent)

  const stats = readingTime(content)

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype) // 🔥 critical bridge
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypePrettyCode, { theme: 'github-dark' })
    .use(rehypeStringify)
    .process(content)

  return {
    slug,
    frontmatter: data as Frontmatter,
    content: processed.toString(),
    readingTime: stats.text,
  }
}

// 🛣️ Static paths for Next.js
export function getAllSlugs(): { slug: string }[] {
  const files = fs.readdirSync(postsDir)

  return files.map((file) => ({
    slug: file.replace(/\.md$/, ''),
  }))
}
