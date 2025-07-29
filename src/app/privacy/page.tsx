import { makeMetaData } from '@lib/metadata'

import { PrivacyPage } from '@components/pages/privacy'

export const metadata = makeMetaData('Privacy')

export default function Page() {
  return <PrivacyPage />
}
