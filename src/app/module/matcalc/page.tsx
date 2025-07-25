 
import { MatcalcQueryPage } from '@/components/pages/apps/matcalc/matcalc-page'
import MODULE_INFO from '@components/pages/apps/matcalc/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <MatcalcQueryPage />
}
