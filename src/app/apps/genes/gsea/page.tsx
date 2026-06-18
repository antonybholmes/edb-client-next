import { GseaPage } from '@/components/pages/apps/genes/gsea/gsea-page'
import MODULE_INFO from '@/components/pages/apps/genes/gsea/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaPage />
}
