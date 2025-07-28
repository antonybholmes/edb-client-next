import { PathwayQueryPage } from '@/components/pages/apps/genes/pathway/pathway-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/genes/pathway/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <PathwayQueryPage />
}
