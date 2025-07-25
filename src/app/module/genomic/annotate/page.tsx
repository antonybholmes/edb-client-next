import { AnnotationQueryPage } from '@components/pages/apps/genomic/annotate/annotate'
import MODULE_INFO from '@components/pages/apps/genomic/annotate/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <AnnotationQueryPage />
}
