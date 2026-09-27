import { BaseCol } from '@/components/layout/base-col'
import { IChildrenProps } from '@/interfaces/children-props'
import { IPos } from '@/interfaces/pos'
import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { ReactNode, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { create } from 'zustand'
import { TOOLTIP_CLEAR_MS } from './tooltip-provider'

const CROSSHAIR_CLS =
  'absolute z-(--z-modal) pointer-events-none w-px h-px top-0 left-0 opacity-20 mix-blend-multiply'

const TOOLTIP_CLS =
  'z-(--z-tooltip) rounded-xl bg-black/50 backdrop-blur-xs p-4 flex flex-col text-xs text-white pointer-events-none'

const CROSS_CLS = 'absolute pointer-events-none aspect-square top-0 left-0'

const CROSS_SIZE = 9
const CROSS_GAP = CROSS_SIZE
const CROSS_MID = Math.floor(CROSS_SIZE / 2)
const ANIMATION_DURATION_MS = 0.1
const EASE = 'power1.out'

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

  /**
   * The color of the crosshair lines.
   */
  color?: string
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
      const {
        pos,
        clientPos,
        content,
        offset = DEFAULT_OFFSET,
        color = 'var(--color-foreground)',
      } = crosshair

      cancelPendingFrame()

      clearPendingTimeout()

      pendingCrosshair = { pos, clientPos, content, offset, color }

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
  const vTopRef = useRef<HTMLSpanElement>(null)
  const vBottomRef = useRef<HTMLSpanElement>(null)
  const hLeftRef = useRef<HTMLSpanElement>(null)
  const hRightRef = useRef<HTMLSpanElement>(null)
  const crossRef = useRef<HTMLDivElement>(null)

  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    return dispose
  }, [dispose])

  const { tooltip, useFixed } = useMemo(() => {
    if (!crosshair) {
      return { tooltip: null, usePortal: false }
    }

    const useFixed = !!crosshair.clientPos
    const pos = useFixed ? crosshair.clientPos : crosshair.pos
    const tooltip = (
      <BaseCol
        className={cn(useFixed ? 'fixed' : 'absolute', TOOLTIP_CLS)}
        style={{
          left: pos.x + crosshair.offset.x,
          top: pos.y + crosshair.offset.y,
        }}
      >
        {crosshair.content}
      </BaseCol>
    )

    return { tooltip, useFixed }
  }, [crosshair])

  // const { tooltipPos, useFixed } = useMemo(() => {
  //   if (!crosshair) {
  //     return { tooltipPos: null, useFixed: false }
  //   }

  //   const useFixed = !!crosshair.clientPos
  //   const pos = useFixed ? crosshair.clientPos : crosshair.pos

  //   const tooltipPos: IPos = {
  //     x: pos.x + crosshair.offset.x,
  //     y: pos.y + crosshair.offset.y,
  //   }
  //   return { tooltipPos, useFixed }
  // }, [crosshair])

  useEffect(() => {
    if (!crossRef.current || !crosshair?.pos) {
      return
    }

    if (!tlRef.current) {
      tlRef.current = gsap.timeline()
    }

    const tl = tlRef.current

    tl.to(
      vTopRef.current,
      {
        x: crosshair.pos.x,
        height: crosshair.pos.y - CROSS_GAP,
        duration: ANIMATION_DURATION_MS,
        ease: EASE,
      },
      0
    )
      .to(
        vBottomRef.current,
        {
          x: crosshair.pos.x,
          y: crosshair.pos.y + CROSS_GAP,
          duration: ANIMATION_DURATION_MS,
          ease: EASE,
        },
        0
      )
      .to(
        hLeftRef.current,
        {
          y: crosshair.pos.y,
          width: crosshair.pos.x - CROSS_GAP,
          duration: ANIMATION_DURATION_MS,
          ease: EASE,
        },
        0
      )
      .to(
        hRightRef.current,
        {
          y: crosshair.pos.y,
          x: crosshair.pos.x + CROSS_GAP,
          duration: ANIMATION_DURATION_MS,
          ease: EASE,
        },
        0
      )
      .to(
        crossRef.current,
        {
          x: crosshair.pos.x - CROSS_MID,
          y: crosshair.pos.y - CROSS_MID,
          duration: ANIMATION_DURATION_MS,
          ease: EASE,
        },
        0
      )
  }, [crosshair?.pos])

  return (
    <>
      {children && children}

      <span
        ref={vTopRef}
        className={CROSSHAIR_CLS}
        style={{
          backgroundColor: crosshair?.color,
          visibility: crosshair ? 'visible' : 'hidden',
        }}
      />

      <span
        ref={vBottomRef}
        className={CROSSHAIR_CLS}
        style={{
          height: '100%',
          backgroundColor: crosshair?.color,
          visibility: crosshair ? 'visible' : 'hidden',
        }}
      />

      <span
        ref={hLeftRef}
        className={CROSSHAIR_CLS}
        style={{
          backgroundColor: crosshair?.color,
          visibility: crosshair ? 'visible' : 'hidden',
        }}
      />
      <span
        ref={hRightRef}
        className={CROSSHAIR_CLS}
        style={{
          width: '100%',
          backgroundColor: crosshair?.color,
          visibility: crosshair ? 'visible' : 'hidden',
        }}
      />

      <div
        ref={crossRef}
        id="cross"
        className={CROSS_CLS}
        style={{
          width: CROSS_SIZE,
          height: CROSS_SIZE,
          visibility: crosshair ? 'visible' : 'hidden',
        }}
      >
        <span
          className="w-full absolute h-px bg-current"
          style={{ top: CROSS_MID, backgroundColor: crosshair?.color }}
        />
        <span
          className="h-full absolute w-px bg-current"
          style={{ left: CROSS_MID, backgroundColor: crosshair?.color }}
        />
      </div>

      {tooltip && (
        <>{useFixed ? createPortal(tooltip, document.body) : tooltip}</>
      )}

      {/* <BaseCol
            className={cn(
              useFixed ? 'fixed' : 'absolute',
              crosshair.content ? 'visible' : 'invisible',
              TOOLTIP_CLS
            )}
            style={{
              left: tooltipPos?.x ?? 0,
              top: tooltipPos?.y ?? 0,
            }}
          >
            {crosshair.content}
          </BaseCol> */}
    </>
  )
}
