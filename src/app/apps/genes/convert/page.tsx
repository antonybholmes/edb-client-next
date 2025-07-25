import { GeneConvQueryPage } from '@/components/pages/apps/genes/gene-convert/gene-convert-page'
import MODULE_INFO from '@components/pages/apps/genes/gene-convert/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <GeneConvQueryPage />
}
