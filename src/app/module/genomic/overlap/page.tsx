import { OverlapQueryPage } from '@/components/pages/modules/genomic/overlap/overlap-page'
import MODULE_INFO from '@components/pages/modules/genomic/overlap/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <OverlapQueryPage />
}
