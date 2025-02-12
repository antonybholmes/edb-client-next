import { MotifsQueryPage } from '@components/pages/modules/gene/motifs/motifs'

import MODULE_INFO from '@components/pages/modules/gene/motifs/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <MotifsQueryPage />
}
