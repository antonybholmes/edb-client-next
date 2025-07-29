import { HubsPage } from '@/components/pages/apps/hubs/hubs-page'
import { makeMetaDataFromModule } from '@/lib/metadata'
import MODULE_INFO from '@components/pages/apps/hubs/module.json'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <HubsPage />
}
