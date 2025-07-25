import { GexQueryPage } from '@components/pages/apps/gex/gex'
import MODULE_INFO from '@components/pages/apps/gex/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <GexQueryPage />
}
