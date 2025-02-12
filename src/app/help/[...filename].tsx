import { BaseCol } from '@/components/layout/base-col'
import { MarkdownContent } from '@/components/markdown-content'
//import client from '../ tina/__generated__/client'

export async function generateStaticParams() {
  // const pages = await client.queries.postConnection()
  // const paths = pages.data?.postConnection?.edges?.map((edge) => ({
  //   filename: edge?.node?._sys.breadcrumbs,
  // }))

  return []
}

export default async function HelpPage({}: { params: { filename: string[] } }) {
  // const data = await client.queries.post({
  //   relativePath: `${params.filename}.md`,
  // })

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
        {/* <Content /> */}
      </MarkdownContent>
    </article>
  )
}
