import { BaseCol } from '@/components/layout/base-col'
import { IPos } from '@/interfaces/pos'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode, useEffect } from 'react'
import { create } from 'zustand'
import { samePosition, TOOLTIP_CLEAR_MS } from './tooltip-provider'

interface ICrosshair {
  pos: IPos
  content?: ReactNode
  offset?: IPos
}

const DEFAULT_OFFSET: IPos = { x: 10, y: 10 }

interface ICrosshairStore {
  crosshair: ICrosshair | null
  showCrosshair: (crosshair: ICrosshair) => void
  hideCrosshair: () => void
  dispose: () => void
}

export const useCrosshairStore = create<ICrosshairStore>()((set, get) => {
  let clearTimeoutId: ReturnType<typeof setTimeout> | null = null
  let crosshairFrame: number | null = null
  let pendingCrosshair: ICrosshair | null = null

  const cancelPendingFrame = () => {
    if (crosshairFrame !== null) {
      cancelAnimationFrame(crosshairFrame)
      crosshairFrame = null
    }

    pendingCrosshair = null
  }

  return {
    crosshair: null,

    showCrosshair: (crosshair) => {
      const { pos, content, offset = DEFAULT_OFFSET } = crosshair

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      // if (samePosition(get().crosshair, pos)) {
      //   cancelPendingFrame()
      //   return
      // }

      if (crosshairFrame !== null && samePosition(pendingCrosshair.pos, pos)) {
        return
      }

      pendingCrosshair = { pos, content, offset }

      if (crosshairFrame !== null) {
        return
      }

      crosshairFrame = requestAnimationFrame(() => {
        crosshairFrame = null

        const nextCrosshair = pendingCrosshair
        pendingCrosshair = null

        if (!samePosition(get().crosshair?.pos, pos)) {
          set({ crosshair: nextCrosshair })
        }
      })
    },

    hideCrosshair: () => {
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

      {crosshair?.pos && (
        <>
          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none w-0.5 h-full top-0"
            style={{ left: crosshair.pos.x - 1, height: crosshair.pos.y - 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none w-0.5 top-0 bottom-0"
            style={{ left: crosshair.pos.x - 1, top: crosshair.pos.y + 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 w-full left-0"
            style={{ top: crosshair.pos.y - 1, width: crosshair.pos.x - 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 right-0"
            style={{ top: crosshair.pos.y - 1, left: crosshair.pos.x + 5 }}
          />

          <span
            className="absolute z-(--z-modal) bg-foreground/50 pointer-events-none h-0.5 w-0.5 top-0 left-0"
            style={{ left: crosshair.pos.x - 1, top: crosshair.pos.y - 1 }}
          />

          {crosshair?.content && (
            <BaseCol
              className={cn(
                'absolute z-(--z-tooltip) rounded-lg bg-black/50 shadow-lg px-4 py-3 text-xs text-white pointer-events-none'
              )}
              style={{
                left: crosshair.pos.x + crosshair.offset.x,
                top: crosshair.pos.y + crosshair.offset.y,
              }}
            >
              {crosshair.content}
            </BaseCol>
          )}
        </>
      )}
    </>
  )
}

{
  /* <BaseCol
                className={cn(
                  'fixed z-(--z-tooltip) rounded-lg bg-black/50 shadow-lg px-4 py-3 text-xs text-white pointer-events-none'
                )}
                style={{
                  left: crosshair.pos.x + crosshair.offset.x,
                  top: crosshair.pos.y + crosshair.offset.y,
                }}
              >
                {crosshair.content}
              </BaseCol>, */
}
