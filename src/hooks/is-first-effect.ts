import { DependencyList, useEffect, useRef } from 'react'

type EffectCallback = (isFirstRender: boolean) => void | (() => void)

/**
 * A custom hook that runs an effect only on updates, not on the initial render.
 *
 * @param effect The effect callback function to run on updates.
 * @param deps The dependency list that determines when the effect should run.
 */
export function useIsFirstEffect(effect: EffectCallback, deps: DependencyList) {
  const isFirstRender = useRef(true)

  useEffect(() => {
    const first = isFirstRender.current
    isFirstRender.current = false
    console.log('isFirstRender changed', first)
    return effect(first)
  }, deps)
}
