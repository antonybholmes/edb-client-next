import { SeqBrowserPage } from '@/components/pages/apps/genomic/seq-browser/seq-browser-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/genomic/seq-browser/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <SeqBrowserPage />
}
