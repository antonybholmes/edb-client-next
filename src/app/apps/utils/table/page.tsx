import MODULE_INFO from '@/components/pages/apps/utils/table/manifest.json'
import { TableQueryPage } from '@/components/pages/apps/utils/table/table-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TableQueryPage />
    </Suspense>
  )
}
