import MODULE_INFO from '@/components/pages/apps/genes/motifs/module.json'
import { MotifsQueryPage } from '@/components/pages/apps/genes/motifs/motifs-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <MotifsQueryPage />
}
