import MODULE_INFO from '@/components/pages/apps/sankey/manifest.json'
import { SankeyQueryPage } from '@/components/pages/apps/sankey/sankey-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <SankeyQueryPage />
}
