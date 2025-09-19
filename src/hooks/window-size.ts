import { type IDim, NO_DIM } from '@interfaces/dim'
import { useEffect, useState } from 'react'

export const TAILWIND_MEDIA_SM = 640 //	640px	@media (min-width: 640px) { ... }
export const TAILWIND_MEDIA_MD = 768 //md	768px	@media (min-width: 768px) { ... }
export const TAILWIND_MEDIA_LG = 1024 //lg	1024px	@media (min-width: 1024px) { ... }
export const TAILWIND_MEDIA_XL = 1280 //xl	1280px	@media (min-width: 1280px) { ... }
export const TAILWIND_MEDIA_2XL = 1536 //2xl	1536px

// Hook
export function useWindowSize(): IDim {
  const [windowSize, setWindowSize] = useState<IDim>(NO_DIM)

  useEffect(() => {
    const handleResize = () => {
      // Set window width/height to state

      setWindowSize({
        w: window.innerWidth ?? 0,
        h: window.innerHeight ?? 0,
      })
    }

    // Handler to call on window resize
    //const dbResize = debounce(handleResize, 500)

    // Add event listener
    //window.addEventListener('resize', dbResize)
    // Call handler right away so state gets updated with initial window size
    //handleResize()
    // Remove event listener on cleanup
    //return () => window.removeEventListener('resize', dbResize)

    window.addEventListener('resize', handleResize)
    // Call handler right away so state gets updated with initial window size
    handleResize()
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, []) // Empty array ensures that effect is only run on mount

  return windowSize
}
