import { OncoplotQueryPage } from '@/components/pages/apps/oncoplot/oncoplot-page'
import MODULE_INFO from '@components/pages/apps/oncoplot/module.json'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <OncoplotQueryPage />
}
