import { JobsQueryPage } from '@/components/pages/jobs/jobs-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Jobs')

export default function Page() {
  return <JobsQueryPage />
}
