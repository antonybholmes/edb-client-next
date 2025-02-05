import { SeqBrowserQueryPage } from '@/components/pages/modules/genomic/seq-browser/seq-browser'
import MODULE_INFO from '@components/pages/modules/genomic/seq-browser/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <SeqBrowserQueryPage />
}
