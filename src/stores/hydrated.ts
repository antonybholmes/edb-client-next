import { useEffect, useState } from 'react'

export const useHydration = (store: any) => {
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // 1. If it's already hydrated, set it to true immediately
    if (store.persist.hasHydrated()) {
      setHydrated(true)
      return // Exit early, no listeners needed!
    }

    // 2. ONLY register listeners if it hasn't hydrated yet
    const unsubFinish = store.persist.onFinishHydration(() => {
      setHydrated(true)
    })

    // 3. Clean up the listener if the component unmounts before hydration finishes
    return () => {
      unsubFinish()
    }
  }, [store])

  return hydrated
}
