import { TableViewerPage } from '@/components/pages/apps/table-viewer/table-viewer-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/table-viewer/module.json'
import { Suspense } from 'react'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TableViewerPage />
    </Suspense>
  )
}
