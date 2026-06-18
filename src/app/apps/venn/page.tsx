import MODULE_INFO from '@/components/pages/apps/venn/manifest.json'
import { VennPageQuery } from '@/components/pages/apps/venn/venn-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <VennPageQuery />
}
