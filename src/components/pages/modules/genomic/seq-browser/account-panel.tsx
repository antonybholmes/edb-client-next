import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Input } from '@/components/shadcn/ui/themed/input'

import { TEXT_SIGN_IN, TEXT_SIGN_OUT } from '@/consts'
import { APP_ACCOUNT_SIGNED_OUT_URL } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { useAuth0 } from '@auth0/auth0-react'
import { PropsPanel } from '@components/props-panel'
import { useContext, useState } from 'react'
import { SeqBrowserSettingsContext } from './seq-browser-settings-provider'

export function AccountPropsPanel() {
  const { settings, updateSettings } = useContext(SeqBrowserSettingsContext)
  const { edbUser, signInWithApiKey } = useContext(EdbAuthContext)
  const [key, setKey] = useState(settings.apiKey)
  //const [user, setUser] = useState<IUser>({ ...DEFAULT_USER })

  // useEffect(() => {
  //   async function loadUser() {
  //     setUser(await getCachedUser())
  //   }

  //   loadUser()
  // }, [])

  const { logout } = useAuth0()

  return (
    <PropsPanel className="pt-2 pr-2 gap-y-4">
      {edbUser.uuid !== '' ? (
        <span className="text-theme ">
          You are signed in as: <strong>{edbUser.email}</strong>
        </span>
      ) : (
        <span>You are not signed in</span>
      )}
      <VCenterRow className="gap-x-2">
        <Input
          id="name"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="API key..."
          className="grow"
        />
        <Button
          variant="theme"
          onClick={async () => {
            updateSettings({ ...settings, apiKey: key })

            signInWithApiKey(key)
          }}
        >
          {TEXT_SIGN_IN}
        </Button>
      </VCenterRow>
      <VCenterRow className="justify-start">
        {edbUser.uuid && (
          <VCenterRow className="justify-end">
            <Button
              multiProps="red-link"
              onClick={() => {
                //signoutUser()

                logout({
                  logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL },
                })
              }}
            >
              {TEXT_SIGN_OUT}
            </Button>
          </VCenterRow>
        )}
      </VCenterRow>
    </PropsPanel>
  )
}
