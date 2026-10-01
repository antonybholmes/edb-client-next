import MODULE_INFO from '@/components/pages/apps/ngs/wgs/variants/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

import { VariantsQueryPage } from '@/components/pages/apps/ngs/wgs/variants/variants-page'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <VariantsQueryPage />
}
