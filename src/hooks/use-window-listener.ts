import { useEffect } from 'react'

export function useWindowListener(
  event: string,
  handler: (event: Event) => void
) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [])
}
