import MODULE_INFO from '@/components/pages/apps/genomic/seq-browser/module.json'
import { SeqBrowserQueryPage } from '@/components/pages/apps/genomic/seq-browser/seq-browser-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <SeqBrowserQueryPage />
}
