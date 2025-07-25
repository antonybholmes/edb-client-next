import { APP_ID } from '@/consts'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'
import { useEffect } from 'react'

const SETTINGS_KEY = `${APP_ID}:module:hubs:settings:v5`

export interface ISearchItem {
  publicId: string
  name: string
}

export type ISample = ISearchItem

export interface IHub extends ISearchItem {
  genome: string
  platform: string
  institution: string
  url: string
  description: string
  samples: ISample[]
}

export interface IHubOptions {
  showGuidelines: boolean
  genome: string
  hideTracks: boolean
}

export const DEFAULT_HUB_OPTIONS: IHubOptions = {
  hideTracks: false,
  genome: 'hg19',
  showGuidelines: false,
}

const hubsAtom = persistentAtom<IHubOptions>(
  SETTINGS_KEY,
  { ...DEFAULT_HUB_OPTIONS },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function setStore(props: IHubOptions) {
  hubsAtom.set(props)
}

function resetStore() {
  hubsAtom.set({ ...DEFAULT_HUB_OPTIONS })
}

export function useHubsStore(): {
  store: IHubOptions
  setStore: (props: IHubOptions) => void
  resetStore: () => void
} {
  const store = useStore(hubsAtom)

  useEffect(() => {
    // auto recreate if deleted and app is running
    if (!store) {
      resetStore()
    }
  }, [store])

  return { store, setStore, resetStore }
}
