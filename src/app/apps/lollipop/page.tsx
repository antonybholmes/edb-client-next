import { LollipopQueryPage } from '@components/pages/apps/lollipop/lollipop-page'
import MODULE_INFO from '@components/pages/apps/lollipop/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <LollipopQueryPage />
}
