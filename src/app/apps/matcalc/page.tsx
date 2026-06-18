import MODULE_INFO from '@/components/pages/apps/matcalc/manifest.json'
import { MatcalcQueryPage } from '@/components/pages/apps/matcalc/matcalc-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <MatcalcQueryPage />
}
