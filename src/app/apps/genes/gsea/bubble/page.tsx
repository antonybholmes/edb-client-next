import { GseaBubbleQueryPage } from '@/components/pages/apps/genes/gsea/bubble/gsea-bubble-page'
import MODULE_INFO from '@/components/pages/apps/genes/gsea/bubble/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaBubbleQueryPage />
}
