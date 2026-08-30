import { MYACCOUNT_PATH } from '@/components/edb/edb'
import { TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { ClientLayout } from '@/app/client-layout'
import { SupabaseSignIn } from './supabase-signin'

export function SignInPage({
  redirectTo = MYACCOUNT_PATH,
}: {
  redirectTo?: string
}) {
  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signinRequired={false}
      //
    >
      <SupabaseSignIn />
    </CenterLayout>
  )
}

export function SignInQueryPage() {
  return (
    <ClientLayout>
      <SignInPage />
    </ClientLayout>
  )
}
