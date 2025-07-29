import { GeneConvPage } from '@/components/pages/apps/genes/gene-convert/gene-convert-page'
import MODULE_INFO from '@components/pages/apps/genes/gene-convert/module.json'
import { makeMetaDataFromModule } from '@lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <GeneConvPage />
}
