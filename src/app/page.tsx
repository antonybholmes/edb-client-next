import { AppsPage } from '@/components/pages/apps-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Home')

export default function Page() {
  return <AppsPage />
}
