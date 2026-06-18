import { AppsInfoPageQueryPage } from '@/components/pages/about/apps-info-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Apps Info')

export default function Page() {
  return <AppsInfoPageQueryPage />
}
