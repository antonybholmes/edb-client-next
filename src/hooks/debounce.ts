import { useCallback, useEffect, useRef, useState } from 'react'

export const DEFAULT_DEBOUNCE_DELAY_MS = 100

export interface IDebounceOptions<T> {
  delayMs?: number
  // apply an additional function to the value before setting it. Useful for things like clamping or
  // formatting a number input before setting the debounced value.
  fn?: (x: T) => T
  /**
   * Custom equality function to compare the current and previous value. If it returns true, the debounce timer will not reset.
   * This is useful for cases where you want to debounce based on a derived value or want to ignore certain changes.
   * @param a
   * @param b
   * @returns
   */
  equalityFn?: (a: T, b: T) => boolean
}

const identity = <T>(x: T): T => x

/**
 * Debounces a value by a specified delay so we only get the latest value after the delay.
 * As value updates come in, the timer resets. if no new updates come in before the delay
 * expires, the timer completes and the latest value is set and returned.
 *
 * @param value The value to debounce.
 * @param opts Options for debouncing, including delay and a function to transform the value.
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, opts: IDebounceOptions<T> = {}): T {
  // default to 100ms delay if not specified and no additional function (fn) to apply to the value before setting it
  const {
    delayMs = DEFAULT_DEBOUNCE_DELAY_MS,
    fn = identity,
    equalityFn = Object.is,
  } = opts

  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  const latestFnRef = useRef(fn)
  const prevValueRef = useRef(value)

  useEffect(() => {
    latestFnRef.current = fn
  }, [fn])

  useEffect(() => {
    if (equalityFn(prevValueRef.current, value)) {
      return
    }

    prevValueRef.current = value

    const handler = setTimeout(() => {
      setDebouncedValue(latestFnRef.current(value))
    }, delayMs)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delayMs, equalityFn])

  return debouncedValue
}

/**
 * Debounce for function calls
 * @param callback
 * @param delayMs
 * @returns
 */
export function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  opts: IDebounceOptions<T> = {}
) {
  const { delayMs = DEFAULT_DEBOUNCE_DELAY_MS } = opts

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const callbackRef = useRef(callback)

  // keep latest callback without re-subscribing
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const cancel = useCallback(() => {
    if (timeoutRef.current != null) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const debounced = useCallback(
    (...args: Parameters<T>) => {
      cancel()

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delayMs)
    },
    [delayMs]
  )

  // Cleanup on unmount
  useEffect(() => cancel(), [cancel])

  return debounced
}
