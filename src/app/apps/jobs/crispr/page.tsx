import { CrisprQueryPage } from '@/components/pages/apps/jobs/crispr/crispr-page'
import MODULE_INFO from '@/components/pages/apps/jobs/crispr/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <CrisprQueryPage />
}
