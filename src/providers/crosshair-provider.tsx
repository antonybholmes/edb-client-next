import { IPos } from '@/interfaces/pos'
import { ReactNode, useEffect } from 'react'
import { create } from 'zustand'
import { samePosition, TOOLTIP_CLEAR_MS } from './tooltip-provider'

interface ICrosshairStore {
  crosshair: IPos | null
  showCrosshair: (pos: IPos | null) => void
  hideCrosshair: () => void
  dispose: () => void
}

export const useCrosshairStore = create<ICrosshairStore>()((set, get) => {
  let clearTimeoutId: ReturnType<typeof setTimeout> | null = null
  let crosshairFrame: number | null = null
  let pendingCrosshair: IPos | null = null

  const cancelPendingFrame = () => {
    if (crosshairFrame !== null) {
      cancelAnimationFrame(crosshairFrame)
      crosshairFrame = null
    }

    pendingCrosshair = null
  }

  return {
    crosshair: null,

    showCrosshair: (pos) => {
      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      // if (samePosition(get().crosshair, pos)) {
      //   cancelPendingFrame()
      //   return
      // }

      if (crosshairFrame !== null && samePosition(pendingCrosshair, pos)) {
        return
      }

      pendingCrosshair = pos

      if (crosshairFrame !== null) {
        return
      }

      crosshairFrame = requestAnimationFrame(() => {
        crosshairFrame = null

        const nextCrosshair = pendingCrosshair
        pendingCrosshair = null

        if (!samePosition(get().crosshair, nextCrosshair)) {
          set({ crosshair: nextCrosshair })
        }
      })
    },

    hideCrosshair: () => {
      console.log('hideCrosshair')
      cancelPendingFrame()

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
      }

      clearTimeoutId = setTimeout(() => {
        clearTimeoutId = null
        set({ crosshair: null })
      }, TOOLTIP_CLEAR_MS)
    },

    dispose: () => {
      console.log('dispose')
      cancelPendingFrame()

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      set({ crosshair: null })
    },
  }
})

export function useCrosshair() {
  const showCrosshair = useCrosshairStore((state) => state.showCrosshair)
  const hideCrosshair = useCrosshairStore((state) => state.hideCrosshair)

  return { showCrosshair, hideCrosshair }
}

// isolates the fast-changing crosshair position so mousemove only
// re-renders this small overlay, not every GseaPlot in the grid
export function CrosshairProvider({ children }: { children?: ReactNode }) {
  const crosshair = useCrosshairStore((state) => state.crosshair)
  const dispose = useCrosshairStore((state) => state.dispose)

  useEffect(() => {
    return dispose
  }, [dispose])

  return (
    <>
      {children && children}

      {crosshair && (
        <>
          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none w-0.5 h-full top-0"
            style={{ left: crosshair.x - 1, height: crosshair.y - 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none w-0.5 top-0 bottom-0"
            style={{ left: crosshair.x - 1, top: crosshair.y + 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 w-full left-0"
            style={{ top: crosshair.y - 1, width: crosshair.x - 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 right-0"
            style={{ top: crosshair.y - 1, left: crosshair.x + 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 w-0.5 top-0 left-0"
            style={{ left: crosshair.x - 1, top: crosshair.y - 1 }}
          />
        </>
      )}
    </>
  )
}
