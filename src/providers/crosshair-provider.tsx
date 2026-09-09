// setBarPos is a stable useState setter, so consumers of this context

import { IPos } from '@/interfaces/pos'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { TOOLTIP_CLEAR_MS } from './tooltip-provider'

let clearTimeoutId: ReturnType<typeof setTimeout> | null = null

interface ICrosshairContext {
  showCrosshair: (pos: IPos | null) => void
  hideCrosshair: () => void
}

// never re-render when barPos itself changes elsewhere
const CrosshairContext = createContext<ICrosshairContext>({
  showCrosshair: () => {},
  hideCrosshair: () => {},
})

export function useCrosshair() {
  const ctx = useContext(CrosshairContext)
  if (!ctx) {
    throw new Error('useCrosshair must be used within a CrosshairProvider')
  }
  return ctx
}

// isolates the fast-changing crosshair position so mousemove only
// re-renders this small overlay, not every GseaPlot in the grid
export function CrosshairProvider({ children }: { children: ReactNode }) {
  const [crosshair, setCrosshair] = useState<IPos | null>(null)
  const crosshairFrame = useRef<number | null>(null)
  const pendingCrosshair = useRef<IPos | null>(null)

  useEffect(() => {
    return () => {
      if (crosshairFrame.current !== null) {
        cancelAnimationFrame(crosshairFrame.current)
      }
    }
  }, [])

  const showCrosshair = useCallback((pos: IPos | null) => {
    pendingCrosshair.current = pos

    if (crosshairFrame.current !== null) {
      return
    }

    crosshairFrame.current = requestAnimationFrame(() => {
      crosshairFrame.current = null
      setCrosshair(pendingCrosshair.current)
      pendingCrosshair.current = null
    })
  }, [])

  const hideCrosshair = useCallback(() => {
    if (crosshairFrame.current !== null) {
      cancelAnimationFrame(crosshairFrame.current)
      crosshairFrame.current = null
    }

    pendingCrosshair.current = null

    if (clearTimeoutId) {
      clearTimeout(clearTimeoutId)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    clearTimeoutId = setTimeout(() => setCrosshair(null), TOOLTIP_CLEAR_MS)
  }, [])

  const contextValue = useMemo(
    () => ({
      showCrosshair,
      hideCrosshair,
    }),
    [showCrosshair, hideCrosshair]
  )

  return (
    <CrosshairContext.Provider value={contextValue}>
      {children}

      {crosshair && (
        <>
          <span
            className="absolute z-50 border-r border-foreground/80 pointer-events-none w-px h-full top-0"
            style={{ left: crosshair.x }}
          ></span>

          <span
            className="absolute z-50 border-t border-foreground/80 pointer-events-none h-px w-full left-0"
            style={{ top: crosshair.y }}
          ></span>
        </>
      )}
    </CrosshairContext.Provider>
  )
}
