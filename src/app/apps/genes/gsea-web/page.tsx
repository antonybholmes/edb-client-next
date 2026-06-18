import { GseaWebQueryPage } from '@/components/pages/apps/genes/gsea-web/gsea-web-page'
import MODULE_INFO from '@/components/pages/apps/genes/gsea-web/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaWebQueryPage />
}
