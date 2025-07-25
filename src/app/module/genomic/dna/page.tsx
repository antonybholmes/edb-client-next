import { DNAQueryPage } from '@components/pages/apps/genomic/dna/dna'
import MODULE_INFO from '@components/pages/apps/genomic/dna/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <DNAQueryPage />
}
