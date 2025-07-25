import { GseaQueryPage } from '@/components/pages/apps/genes/gsea/gsea-page'
import MODULE_INFO from '@components/pages/apps/genes/gsea/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <GseaQueryPage />
}
