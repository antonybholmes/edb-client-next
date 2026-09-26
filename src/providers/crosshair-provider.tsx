import { BaseCol } from '@/components/layout/base-col'
import { IChildrenProps } from '@/interfaces/children-props'
import { IPos } from '@/interfaces/pos'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { TOOLTIP_CLEAR_MS } from './tooltip-provider'

const CROSSHAIR_CLS =
  'absolute z-(--z-modal) bg-foreground/50 pointer-events-none w-px h-px top-0 left-0'

interface ICrosshair {
  /**
   * The position of the crosshair relative to the SVG or plotting area.
   */
  pos: IPos

  /**
   * The client position of the crosshair, typically the mouse position relative to the viewport.
   * If this is set, the tooltip will float on the window rather than being in the bounds of the svg.
   */
  clientPos?: IPos

  /**
   * Tooltip content
   */
  content?: ReactNode

  /**
   * Offset for the tooltip relative to the crosshair position.
   */
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

  const clearPendingTimeout = () => {
    if (clearTimeoutId !== null) {
      clearTimeout(clearTimeoutId)
      clearTimeoutId = null
    }
  }

  return {
    crosshair: null,

    showCrosshair: (crosshair) => {
      const { pos, clientPos, content, offset = DEFAULT_OFFSET } = crosshair

      cancelPendingFrame()

      clearPendingTimeout()

      pendingCrosshair = { pos, clientPos, content, offset }

      crosshairFrame = requestAnimationFrame(() => {
        crosshairFrame = null

        set({ crosshair: pendingCrosshair })
        pendingCrosshair = null
      })
    },

    hideCrosshair: () => {
      cancelPendingFrame()

      clearPendingTimeout()

      clearTimeoutId = setTimeout(() => {
        clearTimeoutId = null
        set({ crosshair: null })
      }, TOOLTIP_CLEAR_MS)
    },

    dispose: () => {
      cancelPendingFrame()
      clearPendingTimeout()

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
export function CrosshairProvider({ children }: IChildrenProps) {
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
          {/* <span
            className={CROSSHAIR_CLS}
            style={{ left: crosshair.pos.x - 1, height: crosshair.pos.y - 4 }}
          />
 
          <span
            className={CROSSHAIR_CLS}
            style={{ left: crosshair.pos.x - 1, top: crosshair.pos.y - 1 }}
          />

          <span
            className={CROSSHAIR_CLS}
            style={{ top: crosshair.pos.y - 1, width: crosshair.pos.x - 4 }}
          />

          <span
            className={CROSSHAIR_CLS}
            style={{
              top: crosshair.pos.y - 1,
              left: crosshair.pos.x + 4,
              width: '100%',
            }}
          />

          <span
            className={CROSSHAIR_CLS}
            style={{
              left: crosshair.pos.x - 1,
              top: crosshair.pos.y + 4,
              height: '100%',
            }}
          /> */}

          <span
            className={CROSSHAIR_CLS}
            style={{ left: crosshair.pos.x, height: '100%' }}
          />

          <span
            className={CROSSHAIR_CLS}
            style={{ top: crosshair.pos.y, width: '100%' }}
          />

          {crosshair?.content && (
            <>
              {!crosshair.clientPos ? (
                <BaseCol
                  className={cn(
                    'absolute z-(--z-tooltip) rounded-lg bg-black/50 backdrop-blur-sm px-4 py-3 text-xs text-white pointer-events-none'
                  )}
                  style={{
                    left: crosshair.pos.x + crosshair.offset.x,
                    top: crosshair.pos.y + crosshair.offset.y,
                  }}
                >
                  {crosshair.content}
                </BaseCol>
              ) : (
                createPortal(
                  <BaseCol
                    className="fixed z-(--z-tooltip) rounded-lg bg-black/50 backdrop-blur-sm px-4 py-3 text-xs text-white pointer-events-none"

                    style={{
                      left: crosshair.clientPos.x + crosshair.offset.x,
                      top: crosshair.clientPos.y + crosshair.offset.y,
                    }}
                  >
                    {crosshair.content}
                  </BaseCol>,
                  document.body
                )
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
