import { useEffect, useState } from 'react'
import type { StoreApi } from 'zustand'

type PersistStore = StoreApi<any> & {
  persist: {
    hasHydrated: () => boolean
    onHydrate: (fn: () => void) => () => void
    onFinishHydration: (fn: () => void) => () => void
  }
}

export const useHydration = (store: PersistStore) => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const persist = store.persist

    if (!persist) {
      setHydrated(true)
      return
    }

    setHydrated(persist.hasHydrated())

    const unsubHydrate = persist.onHydrate(() => {
      setHydrated(false)
    })

    const unsubFinishHydration = persist.onFinishHydration(() => {
      setHydrated(true)
    })

    return () => {
      unsubHydrate()
      unsubFinishHydration()
    }
  }, [store])

  return hydrated
}
