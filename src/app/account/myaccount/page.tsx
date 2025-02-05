import { MyAccountQueryPage } from '@/components/pages/account/myaccount'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('My Account')

export default function Page() {
  return <MyAccountQueryPage />
}
