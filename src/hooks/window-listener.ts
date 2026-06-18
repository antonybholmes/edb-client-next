import { useEffect, useRef } from 'react'

export function useWindowListener(
  event: string,
  handler: (event: Event) => void
) {
  const handlerRef = useRef(handler)

  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: Event) => {
      handlerRef.current(event)
    }

    window.addEventListener(event, listener)
    return () => window.removeEventListener(event, listener)
  }, [event])
}
