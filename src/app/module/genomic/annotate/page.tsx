import { AnnotationQueryPage } from '@components/pages/modules/genomic/annotate/annotate'
import MODULE_INFO from '@components/pages/modules/genomic/annotate/module.json'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(MODULE_INFO.name)

export default function Page() {
  return <AnnotationQueryPage />
}
