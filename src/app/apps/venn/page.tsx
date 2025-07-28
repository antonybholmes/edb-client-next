import { VennPageQuery } from '@/components/pages/apps/venn/venn-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/venn/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <VennPageQuery />
}
