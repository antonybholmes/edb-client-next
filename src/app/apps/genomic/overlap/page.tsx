import { OverlapQueryPage } from '@/components/pages/apps/genomic/overlap/overlap-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/genomic/overlap/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <OverlapQueryPage />
}
