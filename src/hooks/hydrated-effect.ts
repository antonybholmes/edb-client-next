import { DependencyList, EffectCallback, useEffect } from 'react'
import { useUpdateEffect } from './update-effect'

/**
 * Hook that runs the effect only after the component has hydrated and first rendered.
 *
 * @param effect The effect callback to run.
 * @param deps The dependency list for the effect.
 * @param hasHydrated Boolean indicating if the component has hydrated.
 */
export function useHydratedUpdateEffect(
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

/**
 * Hook that runs the effect only after the component has hydrated.
 *
 * @param effect The effect callback to run.
 * @param deps The dependency list for the effect.
 * @param hasHydrated Boolean indicating if the component has hydrated.
 */
export function useHydratedEffect(
  effect: EffectCallback,
  deps: DependencyList,
  hasHydrated: boolean
) {
  useEffect(() => {
    if (!hasHydrated) {
      return
    }

    return effect()
  }, [hasHydrated, ...deps])
}
