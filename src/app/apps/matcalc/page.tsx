import { MatcalcPage } from '@/components/pages/apps/matcalc/matcalc-page'
import MODULE_INFO from '@/components/pages/apps/matcalc/module.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <MatcalcPage />
}
