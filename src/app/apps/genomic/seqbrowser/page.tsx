
import { SeqBrowserQueryPage } from '@/components/pages/apps/genomic/seq-browser/seq-browser-page'
import MODULE_INFO from '@components/pages/apps/genomic/seq-browser/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <SeqBrowserQueryPage />
}
