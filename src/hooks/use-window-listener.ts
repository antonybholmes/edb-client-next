import { useEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useWindowListener(event: string, handler: any) {
  useEffect(() => {
    window.addEventListener(event, handler)
    return () => window.removeEventListener(event, handler)
  }, [event, handler])
}
