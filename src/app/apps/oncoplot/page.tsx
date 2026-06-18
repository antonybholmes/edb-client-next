import MODULE_INFO from '@/components/pages/apps/wgs/oncoplot/manifest.json'
import { OncoplotQueryPage } from '@/components/pages/apps/wgs/oncoplot/oncoplot-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <OncoplotQueryPage />
}
