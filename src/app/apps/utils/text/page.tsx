import MODULE_INFO from '@/components/pages/apps/utils/text/manifest.json'
import { TextQueryPage } from '@/components/pages/apps/utils/text/text-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TextQueryPage />
    </Suspense>
  )
}
