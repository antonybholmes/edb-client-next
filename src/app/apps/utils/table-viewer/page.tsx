import MODULE_INFO from '@/components/pages/apps/utils/table-viewer/manifest.json'
import { TableViewerQueryPage } from '@/components/pages/apps/utils/table-viewer/table-viewer-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TableViewerQueryPage />
    </Suspense>
  )
}
