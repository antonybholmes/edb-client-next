import { DependencyList, EffectCallback } from 'react'
import { useUpdateEffect } from './update-effect'

export function useHydratedEffect(
  effect: EffectCallback,
  deps: DependencyList,
  hasHydrated: boolean
) {
  useUpdateEffect(() => {
    if (!hasHydrated) {
      return
    }

    return effect()
  }, [hasHydrated, ...deps])
}
