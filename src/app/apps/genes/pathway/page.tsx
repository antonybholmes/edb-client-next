import { PathwayQueryPage } from '@/components/pages/apps/genes/pathway/pathway-page'
import MODULE_INFO from '@components/pages/apps/genes/pathway/module.json'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <PathwayQueryPage />
}
