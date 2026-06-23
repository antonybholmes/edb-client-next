import { useEffect, useState } from 'react'

/**
 * A hook to safely detect if a component has mounted on the client.
 * Use this to avoid hydration mismatches when rendering client-only UI or attributes.
 */
export function useIsMounted(): boolean {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted
}
