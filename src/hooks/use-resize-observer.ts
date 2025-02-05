import { useEffect, type RefObject } from 'react'

export function useResizeObserver<T extends HTMLElement>(
  ref: RefObject<T | undefined | null>,
  callback: (target: T) => void
) {
  //const ref = useRef<T>(null)

  useEffect(() => {
    const element = ref?.current

    if (!element) {
      return
    }

    const observer = new ResizeObserver(() => {
      callback(element)
    })

    observer.observe(element)

    // cleanup by deactivating
    return () => {
      observer.disconnect()
    }
  }, [callback, ref])

  //return ref
}
