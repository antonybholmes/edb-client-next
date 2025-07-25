import MODULE_INFO from '@components/pages/apps/genomic/rev-comp/module.json'
import { RevCompQueryPage } from '@components/pages/apps/genomic/rev-comp/rev-comp'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <RevCompQueryPage />
}
