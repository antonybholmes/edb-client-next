import { HeatmapQueryPage } from '@/components/pages/apps/heatmap/heatmap-page'
import MODULE_INFO from '@/components/pages/apps/heatmap/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <HeatmapQueryPage />
}
