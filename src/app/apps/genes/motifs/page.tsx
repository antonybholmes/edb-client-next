import { MotifsQueryPage } from '@/components/pages/apps/genes/motifs/motifs-page'
import MODULE_INFO from '@components/pages/apps/genes/motifs/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <MotifsQueryPage />
}
