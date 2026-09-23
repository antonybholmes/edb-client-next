import MODULE_INFO from '@/components/pages/apps/network/manifest.json'
import { NetworkQueryPage } from '@/components/pages/apps/network/network-page'
import { makeMetaDataFromModule } from '@/lib/metadata'

export const metadata = makeMetaDataFromModule(MODULE_INFO)

export default function Page() {
  return <NetworkQueryPage />
}
