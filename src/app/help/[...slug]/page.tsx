import { BaseCol } from '@/components/layout/base-col'
import { MarkdownContent } from '@/components/markdown-content'
import { getHelpFiles, HELP_DIRECTORY } from '@/lib/markdown/help'
import { loadMarkdownFile } from '@/lib/markdown/markdown'
import fs from 'fs'
import path from 'path'

function getMarkdownFiles(dir: string): string[] {
  let results: string[] = []
  const list = fs.readdirSync(dir)

  list.forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat && stat.isDirectory()) {
      // If it's a directory, recurse into it
      results = results.concat(getMarkdownFiles(fullPath))
    } else if (file.endsWith('.md')) {
      // If it's a markdown file, add to results
      results.push(fullPath)
    }
  })

  return results
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
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  console.log('slug', slug)

  const fullPath = path.join(HELP_DIRECTORY, ...slug) + '.md'

  const { contentHtml } = await loadMarkdownFile(fullPath)

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
