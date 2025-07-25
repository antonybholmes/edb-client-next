import { SingleCellQueryPage } from '@/components/pages/apps/single-cell/single-cell-page'
import MODULE_INFO from '@components/pages/apps/single-cell/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <SingleCellQueryPage />
}
