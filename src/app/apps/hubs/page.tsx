import { HubsQueryPage } from '@/components/pages/apps/hubs/hubs-page'
import MODULE_INFO from '@/components/pages/apps/hubs/module.json'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <HubsQueryPage />
}
