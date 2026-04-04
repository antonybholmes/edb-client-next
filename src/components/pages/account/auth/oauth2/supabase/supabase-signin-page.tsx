import { TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { MYACCOUNT_PATH } from '@/lib/edb/edb'
import { CoreProviders } from '@/providers/core-providers'
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
      <SupabaseSignIn redirectTo={redirectTo} />
    </CenterLayout>
  )
}

export function SignInQueryPage() {
  return (
    <CoreProviders>
      <SignInPage />
    </CoreProviders>
  )
}
