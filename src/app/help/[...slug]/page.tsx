import { BaseCol } from '@/components/layout/base-col'
import { MarkdownContent } from '@/components/markdown-content'
import { getHelpFiles, HELP_DIRECTORY } from '@/lib/markdown/help'
import { ITopicTree } from '@/lib/markdown/help-utils'
import { IPostData, loadMarkdownFile } from '@/lib/markdown/markdown'
import path from 'path'

function buildPostTree(posts: IPostData[]): ITopicTree {
  // Map each entry by its directory path
  const nodesByDir: Record<string, ITopicTree> = {}

  for (const post of posts) {
    //const segments = post.id.split('/')

    const node: ITopicTree = {
      title: post.data.title as string,
      description: (post.data.description as string) ?? '',
      weight: (post.data.weight as number) ?? 0,
      slug: post.id as string,
      path: [],
      children: [],
    }
    nodesByDir[post.id] = node
  }

  // Build tree
  let root: ITopicTree = {
    title: 'Root',
    description: 'Root',
    weight: -1,
    slug: '',
    path: [],
    children: [],
  }

  for (const [dir, node] of Object.entries(nodesByDir)) {
    const parentSegments = dir.split('/').slice(0, -1)
    const parentDir = parentSegments.join('/')
    const parent = nodesByDir[parentDir]

    if (parent) {
      parent.children.push(node)
    } else {
      root.children.push(node)
    }
  }

  // Recursively sort children by weight
  function sortTree(node: ITopicTree, currentPath: string[] = []) {
    // do not add root to the path
    node.path =
      node.title !== 'Root' ? [...currentPath, node.title] : currentPath

    node.children.sort((a, b) => a.weight - b.weight)

    for (const child of node.children) {
      sortTree(child, node.path)
    }
  }

  // sort the children so we don't add root to the path
  // for (const child of root.children) {
  //   sortTree(child)
  // }

  sortTree(root)

  return root
}

export function generateStaticParams() {
  // const pages = await client.queries.postConnection()
  // const paths = pages.data?.postConnection?.edges?.map((edge) => ({
  //   filename: edge?.node?._sys.breadcrumbs,
  // }))

  const markdownFiles = getHelpFiles()

  console.log('s', markdownFiles)

  return markdownFiles.map((file) => {
    const relativePath = path.relative(HELP_DIRECTORY, file)
    const slug = relativePath.replace(/\.mdx?$/, '').split(path.sep) //filePath.replace(/\\/g, '/')
    console.log('slugs', slug)
    return { slug }
  })
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ slug: string[] }>
}) {
  const { slug } = await params

  console.log('slug', slug)

  const fullPath = path.join(HELP_DIRECTORY, ...slug) + '.md'

  const { contentHtml } = await loadMarkdownFile(slug.join('/'), fullPath)

  // Get the file path for the specific Markdown file based on the slug
  //const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
  //const fileContent = fs.readFileSync(filePath, 'utf8')

  return (
    <article className="flex flex-col gap-y-4">
      <BaseCol className="shrink-0 gap-y-2 rounded-theme border border-border bg-background p-4 text-xs">
        {/* <ul className="flex flex-col gap-y-2">
      {
        data.map((h:unknown) => {
          return (
            <li>
              <ThemeLink
                href={`#${h.slug}`}
                aria-label={`Goto help section ${h.text}`}
              >
                {h.text}
              </ThemeLink>
            </li>
          )
        })
      }
    </ul> */}
      </BaseCol>

      <MarkdownContent className="help flex flex-col gap-y-4 py-1 text-xs">
        {contentHtml}
      </MarkdownContent>
    </article>
  )
}
