import { useEffect, useRef, type RefObject } from 'react'

export function useResizeObserver<T extends HTMLElement>(
  refs: RefObject<T | null> | RefObject<T | null>[],
  callback: (target: ResizeObserverEntry) => void
) {
  const callbackRef = useRef(callback)

  // keep latest callback without re-subscribing
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  // create observer once and subscribe to changes
  // callbackRef.current is mutable and always has the latest callback
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        callbackRef.current(entry)
      }
    })

    // deal with single or multiple refs
    if (Array.isArray(refs)) {
      for (const ref of refs) {
        if (ref.current) {
          observer.observe(ref.current)
        }
      }
    } else {
      if (refs.current) {
        observer.observe(refs.current)
      }
    }

    return () => {
      observer.disconnect()
    }
  }, [refs])
}
