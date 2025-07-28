import { GseaQueryPage } from '@/components/pages/apps/genes/gsea/gsea-page'
import MODULE_INFO from '@components/pages/apps/genes/gsea/module.json'
import { makeMetaDataFromModule } from '@lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaQueryPage />
}
