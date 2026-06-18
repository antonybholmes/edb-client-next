import { GetDNAQueryPage } from '@/components/pages/apps/genomic/get-dna/get-dna-page'
import MODULE_INFO from '@/components/pages/apps/genomic/get-dna/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GetDNAQueryPage />
}
