import { CallbackQueryPage } from '@/components/pages/account/auth/signin-callback-page'
import { TEXT_SIGNED_IN } from '@/consts'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData(TEXT_SIGNED_IN)

export default function Page() {
  return <CallbackQueryPage />
}
