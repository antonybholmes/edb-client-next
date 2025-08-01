import { HelpAutocomplete } from '@/components/help/help-autocomplete'
import { BaseCol } from '@/components/layout/base-col'
import { HCenterRow } from '@/components/layout/h-center-row'
import { MarkdownContent } from '@/components/markdown-content'
import { HELP_DIRECTORY } from '@/lib/markdown/help'
import { HelpNode } from '@/lib/markdown/help-utils'
import { loadMarkdownFile } from '@/lib/markdown/markdown'
import path from 'path'
import nav from '../../../../content/help/toc.json' // or use dynamic fs read

function getAllSlugs(nav: HelpNode[]): string[][] {
  const paths: string[][] = []

  function walk(node: HelpNode) {
    if (node.children && node.children.length > 0) {
      node.children.forEach(walk)
    } else {
      paths.push(node.slug.split('/'))
    }
  }

  nav.forEach(walk)
  return paths
}

function getAllNodes(nav: HelpNode[]): Record<string, HelpNode> {
  const nodes: Record<string, HelpNode> = {}

  function walk(node: HelpNode) {
    nodes[node.slug] = node
    if (node.children && node.children.length > 0) {
      node.children.forEach(walk)
    }
  }

  nav.forEach(walk)
  return nodes
}

export function generateStaticParams() {
  const slugs = getAllSlugs(nav as HelpNode[])
  console.log(
    'Generated slugs:',
    slugs.map((slugArr) => ({ slug: slugArr }))
  )
  return slugs.map((slugArr) => ({ slug: slugArr }))
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  const slugMap = getAllNodes(nav as HelpNode[])

  const node = slugMap[slug.join('/')]

  if (!node) {
    return <div className="p-4">Help page not found</div>
  }

  if (node.type === 'dir') {
    return (
      <div className="p-4">
        <h1 className="text-lg font-semibold">{node.title}</h1>
        <ul className="list-disc pl-5">
          {node.children!.map((child) => (
            <li key={child.slug}>
              <a href={`/help/${child.slug}`}>{child.title}</a>
            </li>
          ))}
        </ul>
      </div>
    )
  } else {
    const fullPath = path.join(HELP_DIRECTORY, ...slug) + '.md'

    const { contentHtml } = await loadMarkdownFile(slug.join('/'), fullPath)

    // Get the file path for the specific Markdown file based on the slug
    //const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
    //const fileContent = fs.readFileSync(filePath, 'utf8')

    return (
      <BaseCol className="flex flex-col gap-y-4 p-4">
        <HCenterRow className="hidden lg:flex">
          <HelpAutocomplete className="w-1/2 xl:w-2/5" />
        </HCenterRow>
        <article className="flex flex-col gap-y-4">
          <MarkdownContent className="help flex flex-col gap-y-4 py-1 text-xs">
            {contentHtml}
          </MarkdownContent>
        </article>{' '}
      </BaseCol>
    )
  }
}
