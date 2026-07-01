import { TEXT_SIGNED_IN } from '@/consts'
import { makeMetaData } from '@/lib/metadata'
import { CallbackQueryPage } from '../../signin-callback-page'

export const metadata = makeMetaData(TEXT_SIGNED_IN)

export default function Page() {
  return <CallbackQueryPage />
}
