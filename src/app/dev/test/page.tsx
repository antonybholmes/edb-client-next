import { TestQueryPage } from '@/components/pages/dev/test-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Test')

export default function Page() {
  return <TestQueryPage />
}
