import { MatcalcPage } from '@/components/pages/apps/matcalc/matcalc-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/matcalc/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <MatcalcPage />
}
