import { ModuleQueryPage } from '@components/pages/module'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Modules')

export default function Page() {
  return <ModuleQueryPage />
}
