import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWindowListener(event: string, handler: unknown) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [])
}
