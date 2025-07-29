import { makeMetaDataFromModule } from '@/lib/metadata'
import { AnnotationPage } from '@components/pages/apps/genomic/annotate/annotate-page'
import MODULE_INFO from '@components/pages/apps/genomic/annotate/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <AnnotationPage />
}
