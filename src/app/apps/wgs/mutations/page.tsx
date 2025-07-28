import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/wgs/mutations/module.json'

import { MutationsQueryPage } from '@components/pages/apps/wgs/mutations/mutations'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <MutationsQueryPage />
}
