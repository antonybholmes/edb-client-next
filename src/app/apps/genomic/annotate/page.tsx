import { AnnotationQueryPage } from '@/components/pages/apps/genomic/annotate/annotate-page'
import MODULE_INFO from '@/components/pages/apps/genomic/annotate/manifest.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <AnnotationQueryPage />
}
