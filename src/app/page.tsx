import { ModuleQueryPage } from '@/components/pages/module'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Home')

export default function Page() {
  return <ModuleQueryPage />
}
