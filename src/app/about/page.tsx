import { AboutQueryPage } from '@components/pages/about'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('About')

export default function Page() {
  return <AboutQueryPage />
}
