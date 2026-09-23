import { GseaBubbleQueryPage } from '@/components/pages/apps/network/gsea-bubble-page'
import MODULE_INFO from '@/components/pages/apps/network/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaBubbleQueryPage />
}
