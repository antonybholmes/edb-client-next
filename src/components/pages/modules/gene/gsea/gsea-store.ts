import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

import {
  DEFAULT_GSEA_DISPLAY_PROPS,
  type IGseaDisplayProps,
} from './gsea-utils'

const SETTINGS_KEY = `${APP_ID}-gsea-settings-v20`

const localStorageMap = persistentAtom<IGseaDisplayProps>(
  SETTINGS_KEY,
  { ...DEFAULT_GSEA_DISPLAY_PROPS },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useGseaStore(): {
  displayProps: IGseaDisplayProps
  setDisplayProps: (props: IGseaDisplayProps) => void
  resetDisplayProps: () => void
} {
  const displayProps = useStore(localStorageMap)

  useEffect(() => {
    // auto recreate if deleted and app is running
    if (!displayProps) {
      resetDisplayProps()
    }
  }, [displayProps])

  function setDisplayProps(props: IGseaDisplayProps) {
    localStorageMap.set(props)
  }

  function resetDisplayProps() {
    localStorageMap.set({ ...DEFAULT_GSEA_DISPLAY_PROPS })
  }

  return { displayProps, setDisplayProps, resetDisplayProps }
}
