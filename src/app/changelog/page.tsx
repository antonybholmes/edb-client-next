import { MarkdownContent } from '@/components/markdown-content'
import { loadMarkdownFile } from '@/lib/markdown/markdown'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Change Log')

export default async function Page() {
  const { contentHtml } = await loadMarkdownFile('CHANGELOG.md')

  return (
    <MarkdownContent className="changelog p-6">{contentHtml}</MarkdownContent>
  )
}
