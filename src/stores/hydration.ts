import { useEffect, useState } from 'react'

export const useHydration = (store: any) => {
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
