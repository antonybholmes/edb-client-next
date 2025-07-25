import { RevCompQueryPage } from '@/components/pages/apps/genomic/rev-comp/rev-comp-page'
import MODULE_INFO from '@components/pages/apps/genomic/rev-comp/module.json'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <RevCompQueryPage />
}
