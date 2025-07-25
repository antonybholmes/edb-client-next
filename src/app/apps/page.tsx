import { AppsQueryPage } from '@/components/pages/apps-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Apps')

export default function Page() {
  return <AppsQueryPage />
}
