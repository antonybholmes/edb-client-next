import { useEffect, useState } from 'react'

export function useReducedMotion(): { reducedMotion: boolean } {
  // Initialize state based on the current system setting
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    () => {
      // Check if window is defined to prevent errors during Server-Side Rendering (SSR)
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      }
      return false
    }
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Update state whenever the system setting changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    // Modern listener syntax
    mediaQuery.addEventListener('change', handleChange)

    // Clean up the event listener when the component unmounts
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return { reducedMotion: prefersReducedMotion }
}
