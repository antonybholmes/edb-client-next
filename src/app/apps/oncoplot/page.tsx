import MODULE_INFO from '@/components/pages/apps/oncoplot/module.json'
import { OncoplotQueryPage } from '@/components/pages/apps/oncoplot/oncoplot-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <OncoplotQueryPage />
}
