import MODULE_INFO from '@/components/pages/apps/utils/text-viewer/manifest.json'
import { TextViewerQueryPage } from '@/components/pages/apps/utils/text-viewer/text-viewer-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextViewerQueryPage />
    </Suspense>
  )
}
