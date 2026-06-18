import { GseaPlotQueryPage } from '@/components/pages/apps/genes/gsea-plot/gsea-plot-page'
import MODULE_INFO from '@/components/pages/apps/genes/gsea-plot/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GseaPlotQueryPage />
}
