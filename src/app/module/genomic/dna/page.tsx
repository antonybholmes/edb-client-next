import { DNAQueryPage } from '@components/pages/modules/genomic/dna/dna'
import MODULE_INFO from '@components/pages/modules/genomic/dna/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <DNAQueryPage />
}
