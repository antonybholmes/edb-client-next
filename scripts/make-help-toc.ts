import { HelpNode } from '@/lib/markdown/help-utils'
import { capitalCase } from '@/lib/text/capital-case'
import fs from 'fs'
import matter from 'gray-matter'
import path from 'path'

function flattenNodes(
  nav: HelpNode[],
  ret: { title: string; description: string; slug: string }[] = []
) {
  ret.push(
    ...nav
      .filter((node) => node.type === 'file')
      .map((node) => ({
        title: node.title,
        description: node.description,
        slug: node.slug,
      }))
  )

  for (const node of nav) {
    if (node.children && node.children.length > 0) {
      flattenNodes(node.children, ret)
    }
  }
}

function extractTitle(filePath: string): {
  title: string
  description: string
} {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const parsed = matter(content)
    return {
      title: parsed.data.title || '',
      description: parsed.data.description || '',
    }
  } catch {
    return { title: '', description: '' }
  }
}

function buildNav(dirPath: string, basePath: string = ''): HelpNode[] {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  // Sort directories first, then files
  const sortedEntries = entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1
    if (!a.isDirectory() && b.isDirectory()) return 1
    return a.name.localeCompare(b.name)
  })

  return sortedEntries
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => {
      const fullPath = path.join(dirPath, entry.name)
      const relativeSlug = path.join(basePath, entry.name)

      if (entry.isDirectory()) {
        return {
          type: 'dir',
          title: capitalCase(entry.name),
          description: '',
          slug: relativeSlug, //entry.name,
          children: buildNav(fullPath, relativeSlug),
        }
      }

      if (entry.isFile() && entry.name.endsWith('.md')) {
        const slug = relativeSlug.replace(/\.mdx?$/, '')
        const { title, description } = extractTitle(fullPath)
        return { type: 'file', slug, title, description, fullPath }
      }

      return null
    })
    .filter(Boolean) as HelpNode[]
}

const helpPath = './content/help'
const nav = buildNav(helpPath)

fs.writeFileSync('./content/help/toc.json', JSON.stringify(nav, null, 2))
console.log('Navigation written to toc.json')

// make search index

const ret: HelpNode[] = []
flattenNodes(nav, ret)

fs.writeFileSync(
  './content/help/search-index.json',
  JSON.stringify(ret, null, 2)
)
console.log('Navigation written to search-index.json')
