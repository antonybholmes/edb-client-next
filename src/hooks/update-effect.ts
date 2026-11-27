import { DependencyList, EffectCallback, useEffect, useRef } from 'react'

type UpdateEffectCallback = (counter: number) => void | (() => void)

/**
 * A custom hook that runs an effect only on updates, not on the initial render.
 *
 * @param effect The effect callback function to run on updates.
 * @param deps The dependency list that determines when the effect should run.
 */
export function useUpdateEffect(effect: EffectCallback, deps: DependencyList) {
  useCounterEffect((counter) => {
    if (counter > 0) {
      effect()
    }
  }, deps)
}

export function useCounterEffect(
  effect: UpdateEffectCallback,
  deps: DependencyList
) {
  const counter = useRef(0)

  useEffect(() => {
    const cleanup = effect(counter.current)

    counter.current += 1

    return cleanup
  }, deps)
}
