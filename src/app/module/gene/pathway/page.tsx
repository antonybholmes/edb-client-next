import MODULE_INFO from '@components/pages/modules/gene/pathway/module.json'
import { PathwayQueryPage } from '@components/pages/modules/gene/pathway/pathway'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <PathwayQueryPage />
}
