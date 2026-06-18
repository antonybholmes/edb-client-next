import { makeMetaData } from '@/lib/metadata'

import { PrivacyQueryPage } from '@/components/pages/privacy-page'

export const metadata = makeMetaData('Privacy')

export default function Page() {
  return <PrivacyQueryPage />
}
