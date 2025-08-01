import { HelpAutocomplete } from '@/components/help/help-autocomplete'
import { HelpTreeNode } from '@/components/help/help-tree-node'
import { BaseCol } from '@/components/layout/base-col'
import { HCenterRow } from '@/components/layout/h-center-row'
import { ThemeLink } from '@/components/link/theme-link'
import { MarkdownContent } from '@/components/markdown-content'
import { logger } from '@/lib/logger'
import { HelpNode } from '@/lib/markdown/help-utils'
import { loadMarkdownFile } from '@/lib/markdown/markdown'
import { cn } from '@/lib/shadcn-utils'
import nav from '../../../../content/help/toc.json' // or use dynamic fs read

function getAllSlugs(nav: HelpNode): string[][] {
  const paths: string[][] = []

  function walk(node: HelpNode) {
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        walk(child)
      }
    }

    paths.push(node.slug)
  }

  walk(nav)
  return paths
}

function getAllNodes(nav: HelpNode[]): Record<string, HelpNode> {
  const nodes: Record<string, HelpNode> = {}

  function walk(node: HelpNode) {
    nodes[node.slug.join('/')] = node
    if (node.children && node.children.length > 0) {
      node.children.forEach(walk)
    }
  }

  nav.forEach(walk)
  return nodes
}

export function generateStaticParams() {
  const slugs = getAllSlugs(nav[0] as HelpNode)
  logger.log(
    'Generated slugs:',
    slugs.map((slugArr) => ({ slug: slugArr }))
  )
  return slugs.map((slugArr) => ({ slug: slugArr }))
}

// function HelpList({ items, level = 0 }: { items: HelpNode[]; level?: number }) {
//   return (
//     <ol>
//       {items.map((item) => (
//         <li key={item.slug}>
//           <VCenterRow
//             className={cn(
//               'justify-between items-center grow shrink-0 rounded-theme h-full gap-x-2',
//               [isSelected, 'bg-muted/70 font-bold', 'hover:bg-muted/50']
//             )}
//           >
//             <a
//               href={`/help/${item.slug}`}
//               className="flex flex-row items-center justify-start grow h-full"
//               style={{
//                 paddingLeft: `${level * 0.5 + 0.5}rem`,
//               }}
//             >
//               {name}
//             </a>

//             {hasChildren && (
//               <button
//                 data-valid-slug={isValidSlug}
//                 className="flex flex-row items-center data-[valid-slug=false]:grow justify-between h-full gap-x-2 pr-2"
//                 onClick={() => {
//                   setIsOpen(!isOpen)

//                   setSelected(node.slug)
//                 }}
//                 style={{
//                   paddingLeft: `${level * 0.5 + 0.5}rem`,
//                 }}
//               >
//                 {!isValidSlug && (
//                   <span className="flex flex-row items-center justify-start grow">
//                     {name}
//                   </span>
//                 )}

//                 <VCenterRow className="justify-center w-4">
//                   <ChevronRightIcon
//                     className="trans-transform"
//                     style={{
//                       transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
//                     }}
//                   />
//                 </VCenterRow>
//               </button>
//             )}
//           </VCenterRow>
//           {item.children && item.children.length > 0 && (
//             <HelpList items={item.children} level={level + 1} />
//           )}
//         </li>
//       ))}
//     </ol>
//   )
// }

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

  if (node.type === 'dir' && !node.fullPath) {
    return (
      <BaseCol className="flex flex-col gap-y-4 p-4">
        <HCenterRow className="hidden lg:flex">
          <HelpAutocomplete className="w-1/2 xl:w-2/5" />
        </HCenterRow>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <aside className="hidden lg:block col-span-1">
            <ul className="text-xs">
              <HelpTreeNode node={nav[0] as HelpNode} currentNode={node} />
            </ul>
          </aside>
          <article className="flex flex-col gap-y-4 col-span-3">
            <h1 className="text-lg font-semibold">{node.title}</h1>
            <ul>
              {node.children!.map((child, ci) => (
                <li
                  key={child.slug.join('/')}
                  className={cn(
                    'flex flex-col gap-y-2 py-5',
                    ci > 0 && 'border-t border-border/50'
                  )}
                >
                  <ThemeLink
                    href={`/help/${child.slug.join('/')}`}
                    className="font-semibold"
                  >
                    {child.title}
                  </ThemeLink>

                  <span className="text-sm text-foreground/70">
                    {child.description}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </BaseCol>
    )
  } else {
    //const fullPath = path.join(HELP_DIRECTORY, ...slug) + '.md'

    const { contentHtml } = await loadMarkdownFile(
      slug.join('/'),
      node.fullPath || ''
    )

    // Get the file path for the specific Markdown file based on the slug
    //const filePath = path.join(process.cwd(), 'content', `${slug}.md`)
    //const fileContent = fs.readFileSync(filePath, 'utf8')

    return (
      <BaseCol className="flex flex-col gap-y-4 p-4">
        <HCenterRow className="hidden lg:flex">
          <HelpAutocomplete className="w-1/2 xl:w-2/5" />
        </HCenterRow>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <aside className="hidden lg:block col-span-1">
            <ul className="text-xs">
              <HelpTreeNode node={nav[0] as HelpNode} currentNode={node} />
            </ul>
          </aside>
          <article className="flex flex-col gap-y-4 col-span-3">
            <MarkdownContent className="help flex flex-col gap-y-4 py-1 text-xs">
              {contentHtml}
            </MarkdownContent>
          </article>
        </div>
      </BaseCol>
    )
  }
}
