import MODULE_INFO from '@components/pages/apps/wgs/mutations/module.json'

import { MutationsQueryPage } from '@components/pages/apps/wgs/mutations/mutations'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <MutationsQueryPage />
}
