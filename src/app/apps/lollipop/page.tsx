import { makeMetaDataFromModule } from '@/lib/metadata'
import { LollipopQueryPage } from '@components/pages/apps/lollipop/lollipop-page'
import MODULE_INFO from '@components/pages/apps/lollipop/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <LollipopQueryPage />
}
