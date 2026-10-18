import MODULE_INFO from '@/components/pages/apps/volcano/manifest.json'
import { VolcanoQueryPage } from '@/components/pages/apps/volcano/volcano-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <VolcanoQueryPage />
}
