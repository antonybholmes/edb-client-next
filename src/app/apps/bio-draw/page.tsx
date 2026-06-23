import { BioDrawQueryPage } from '@/components/pages/apps/bio-draw/bio-draw-page'
import MODULE_INFO from '@/components/pages/apps/genomic/rev-comp/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <BioDrawQueryPage />
}
