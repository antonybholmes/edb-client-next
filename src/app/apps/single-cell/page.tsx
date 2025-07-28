import { SingleCellQueryPage } from '@/components/pages/apps/single-cell/single-cell-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/single-cell/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <SingleCellQueryPage />
}
