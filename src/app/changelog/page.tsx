import { ChangelogQueryPage } from '@/components/pages/changelog-page'
import { loadMarkdownFile } from '@/lib/markdown/markdown'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Change Log')

export default async function Page() {
  const { contentHtml } = await loadMarkdownFile('CHANGELOG', 'CHANGELOG.md')

  return <ChangelogQueryPage contentHtml={contentHtml} />
}
