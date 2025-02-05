import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'
import { DEFAULT_GEX_DISPLAY_PROPS, type IGexDisplayProps } from './gex-utils'

const SETTINGS_KEY = `${APP_ID}-gex-settings-v5`

const localStorageMap = persistentAtom<IGexDisplayProps>(
  SETTINGS_KEY,
  { ...DEFAULT_GEX_DISPLAY_PROPS },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useGexStore(): [
  IGexDisplayProps,
  (props: IGexDisplayProps) => void,
  () => void,
] {
  const store = useStore(localStorageMap)

  useEffect(() => {
    // auto recreate if deleted and app is running
    if (!store) {
      reset()
    }
  }, [store])

  function setStore(props: IGexDisplayProps) {
    localStorageMap.set(props)
  }

  function reset() {
    localStorageMap.set({ ...DEFAULT_GEX_DISPLAY_PROPS })
  }

  return [store, setStore, reset]
}
