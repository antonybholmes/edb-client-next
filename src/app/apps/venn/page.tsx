import { VennPageQuery } from '@/components/pages/apps/venn/venn-page'
import MODULE_INFO from '@components/pages/apps/venn/module.json'

import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <VennPageQuery />
}
