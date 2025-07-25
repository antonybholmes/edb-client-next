import { VCenterRow } from '@layout/v-center-row'
import { Button } from '@themed/button'
import { Input } from '@themed/input'

import { TEXT_SIGN_IN, TEXT_SIGN_OUT } from '@/consts'
import { PropsPanel } from '@components/props-panel'
import { SIGN_OUT_ROUTE } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { redirect } from '@lib/http/urls'
import { LinkButton } from '@themed/link-button'
import { useState } from 'react'
import { useSeqBrowserSettings } from './seq-browser-settings'

export function AccountPropsPanel() {
  const { settings, updateSettings } = useSeqBrowserSettings()
  const { session, signInWithApiKey } = useEdbAuth()
  const [key, setKey] = useState(settings.apiKey)
  //const [user, setUser] = useState<IUser>({ ...DEFAULT_USER })

  // useEffect(() => {
  //   async function loadUser() {
  //     setUser(await getCachedUser())
  //   }

  //   loadUser()
  // }, [])

  return (
    <PropsPanel className="pt-2 pr-2 gap-y-4">
      {session ? (
        <span className="text-theme ">
          You are signed in as: <strong>{session.user.email}</strong>
        </span>
      ) : (
        <span>You are not signed in</span>
      )}
      <VCenterRow className="gap-x-2">
        <Input
          id="name"
          value={key}
          onChange={e => setKey(e.target.value)}
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
        {session && (
          <VCenterRow className="justify-end">
            <LinkButton
              onClick={() => {
                //signout()
                redirect(SIGN_OUT_ROUTE)
              }}
            >
              {TEXT_SIGN_OUT}
            </LinkButton>
          </VCenterRow>
        )}
      </VCenterRow>
    </PropsPanel>
  )
}
