import { TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { MYACCOUNT_ROUTE } from '@/lib/edb/edb'
import { SupabaseSignIn } from './signin'

export function SignInPage({
  redirectTo = MYACCOUNT_ROUTE,
}: {
  redirectTo?: string
}) {
  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signedRequired={false}
      //showAccountButton={false}
    >
      <SupabaseSignIn redirectTo={redirectTo} />
    </CenterLayout>
  )
}
