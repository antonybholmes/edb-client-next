import { useEffect } from 'react'

export function useHydratedEffect(
  effect: React.EffectCallback,
  deps: React.DependencyList,
  hasHydrated: boolean
) {
  useEffect(() => {
    if (!hasHydrated) return
    return effect()
  }, [hasHydrated, ...deps])
}
