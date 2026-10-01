import { LollipopQueryPage } from '@/components/pages/apps/ngs/wgs/lollipop/lollipop-page'
import MODULE_INFO from '@/components/pages/apps/ngs/wgs/lollipop/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <LollipopQueryPage />
}
