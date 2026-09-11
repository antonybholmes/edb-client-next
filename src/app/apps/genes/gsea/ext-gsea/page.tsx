import { ExtGseaQueryPage } from '@/components/pages/apps/genes/gsea/ext-gsea/ext-gsea-page'
import MODULE_INFO from '@/components/pages/apps/genes/gsea/ext-gsea/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <ExtGseaQueryPage />
}
