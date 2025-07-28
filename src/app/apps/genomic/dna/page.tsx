import { DNAQueryPage } from '@/components/pages/apps/genomic/dna/dna-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/genomic/dna/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <DNAQueryPage />
}
