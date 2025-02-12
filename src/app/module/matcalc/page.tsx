import { MatcalcQueryPage } from '@components/pages/modules/matcalc/matcalc'
import MODULE_INFO from '@components/pages/modules/matcalc/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <MatcalcQueryPage />
}
