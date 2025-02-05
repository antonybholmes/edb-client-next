import { APP_ID } from '@/consts'

import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import MODULE_INFO from './module.json'

import type { IGexValueType } from './gex-utils'

const KEY = `${APP_ID}-${MODULE_INFO.name.toLowerCase()}-settings-v2`

export interface IGexSettings {
  defaultGexValueType: { [key: string]: IGexValueType }
}

export const DEFAULT_SETTINGS: IGexSettings = {
  defaultGexValueType: {},
}

const localStorageMap = persistentAtom<IGexSettings>(
  KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useGexSettingsStore(): {
  settings: IGexSettings
  applySettings: (store: IGexSettings) => void
  reset: () => void
} {
  const settings = useStore(localStorageMap)

  // // first load in the default values from the store
  // const [settings, setSettings] = useState<ISettings>({
  //   passwordless: localStore.passwordless === TRUE,
  //   staySignedIn: localStore.staySignedIn === TRUE,
  //   theme: localStore.theme as Theme,
  // })

  // // when the in memory store is updated, trigger a write to localstorage.
  // // There may be an unnecessary write at the start where the localstorage
  // // is overwritten with a copy of itself, but this is ok.
  // useEffect(() => {
  //   // Write to store when there are changes
  //   localStorageMap.set({
  //     passwordless: localStore.passwordless.toString(),
  //     staySignedIn: localStore.staySignedIn.toString(),
  //     theme: settings.theme,
  //   })
  // }, [settings])

  function applySettings(settings: IGexSettings) {
    localStorageMap.set(settings)
  }

  function reset() {
    applySettings({ ...DEFAULT_SETTINGS })
  }

  return { settings, applySettings, reset }
}
