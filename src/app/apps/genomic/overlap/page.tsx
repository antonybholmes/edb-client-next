import MODULE_INFO from '@/components/pages/apps/genomic/overlap/module.json'
import { OverlapQueryPage } from '@/components/pages/apps/genomic/overlap/overlap-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <OverlapQueryPage />
}
