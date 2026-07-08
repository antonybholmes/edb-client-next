import { DependencyList, EffectCallback, useEffect, useRef } from 'react'

/**
 * A custom hook that runs an effect only on updates, not on the initial render.
 *
 * @param effect The effect callback function to run on updates.
 * @param deps The dependency list that determines when the effect should run.
 */
export function useUpdateEffect(effect: EffectCallback, deps: DependencyList) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    return effect()
  }, deps)
}
