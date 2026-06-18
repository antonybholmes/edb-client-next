import { useEffect, useRef } from 'react'

export function useDocumentListener(
  event: string,
  handler: (event: Event) => void
) {
  const handlerRef = useRef(handler)

  handlerRef.current = handler

  useEffect(() => {
    const listener = (event: Event) => {
      handlerRef.current(event)
    }

    document.addEventListener(event, listener)
    return () => document.removeEventListener(event, listener)
  }, [event])
}
