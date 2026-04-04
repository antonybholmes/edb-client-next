import { InfoQueryPage } from '@/components/pages/apps/info/info-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('About')

export default function Page() {
  return <InfoQueryPage />
}
