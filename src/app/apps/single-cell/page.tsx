import MODULE_INFO from '@/components/pages/apps/ngs/single-cell/manifest.json'
import { SingleCellQueryPage } from '@/components/pages/apps/ngs/single-cell/single-cell-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <SingleCellQueryPage />
}
