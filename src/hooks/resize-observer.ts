import type { IDim } from '@/interfaces/dim'
import { useEffect, useRef, useState, type RefObject } from 'react'

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
    const observer = new ResizeObserver((entries) => {
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

export function useSizeObserver<T extends HTMLElement>(
  refs: RefObject<T | null> | RefObject<T | null>[],
  callback: ((size: IDim) => void) | undefined = undefined
): IDim {
  const [size, setSize] = useState<IDim>({ w: 0, h: 0 })

  useResizeObserver(refs, (entry) => {
    const size = {
      w: entry.contentRect.width,
      h: entry.contentRect.height,
    }
    setSize(size)

    callback?.(size)
  })

  return size
}

export const TAILWIND_BREAKPOINTS = new Map<number, string>([
  [640, 'sm'],
  [768, 'md'],
  [1024, 'lg'],
  [1280, 'xl'],
  [1536, '2xl'],
])

function getBreakpointName(width: number): number {
  if (width < 320) {
    return 320
  } else if (width < 480) {
    return 480
  } else if (width < 640) {
    return 640
  } else if (width < 768) {
    return 768
  } else if (width < 1024) {
    return 1024
  } else if (width < 1280) {
    return 1280
  } else if (width < 1536) {
    return 1536
  }

  return 1536
}

/**
 * Simplifies resize observer to return breakpoints for a given
 * set of collapse points. This is useful for responsive design and layout changes.
 * The default are some standard monitor resolutions.
 *
 * @param refs
 * @param callback
 * @param breakpoints
 * @returns
 */
export function useBreakpointSizeObserver<T extends HTMLElement>(
  refs: RefObject<T | null> | RefObject<T | null>[],

  callback: ((breakpoint: number | string) => void) | undefined = undefined,
  breakpoints: (w: number) => number | string = getBreakpointName
): number | string {
  const [breakpoint, setBreakpoint] = useState<number | string>(640)

  useSizeObserver(refs, (size) => {
    const newBreakpoint = breakpoints(size.w)

    if (newBreakpoint !== breakpoint) {
      setBreakpoint(newBreakpoint)
      callback?.(newBreakpoint)
    }
  })

  return breakpoint
}
