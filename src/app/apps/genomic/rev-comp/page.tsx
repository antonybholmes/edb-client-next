import { RevCompPage } from '@/components/pages/apps/genomic/rev-comp/rev-comp-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/genomic/rev-comp/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <RevCompPage />
}
