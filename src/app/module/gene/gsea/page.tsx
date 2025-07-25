import { GseaQueryPage } from '@/components/pages/apps/gene/gsea/gsea'
import MODULE_INFO from '@components/pages/apps/gene/gsea/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <GseaQueryPage />
}
