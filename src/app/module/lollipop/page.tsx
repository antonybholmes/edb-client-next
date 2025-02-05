import { LollipopQueryPage } from '@components/pages/modules/lollipop/lollipop'
import MODULE_INFO from '@components/pages/modules/lollipop/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <LollipopQueryPage />
}
