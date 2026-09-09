import { BaseCol } from '@/components/layout/base-col'
import { IPos } from '@/interfaces/pos'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode, useEffect } from 'react'

import { createPortal } from 'react-dom'
import { create } from 'zustand'

export const TOOLTIP_CLEAR_MS = 300

export interface ITooltipState {
  pos: IPos
  className?: string
  content: ReactNode
}

interface ITooltipStore {
  tooltip: ITooltipState | null
  showTooltip: (tooltip: ITooltipState) => void
  hideTooltip: () => void
  dispose: () => void
}

export const useTooltipStore = create<ITooltipStore>()((set, get) => {
  let clearTimeoutId: ReturnType<typeof setTimeout> | null = null
  let tooltipFrame: number | null = null
  let pendingTooltip: ITooltipState | null = null

  const cancelPendingFrame = () => {
    if (tooltipFrame !== null) {
      cancelAnimationFrame(tooltipFrame)
      tooltipFrame = null
    }

    pendingTooltip = null
  }

  const samePosition = (a: IPos | null, b: IPos) =>
    a?.x === b.x && a?.y === b.y

  return {
    tooltip: null,
    showTooltip: (t) => {
      const current = get().tooltip

      if (samePosition(current?.pos ?? null, t.pos)) {
        cancelPendingFrame()
        return
      }

      if (
        tooltipFrame !== null &&
        pendingTooltip !== null &&
        samePosition(pendingTooltip.pos, t.pos)
      ) {
        return
      }

      pendingTooltip = t

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      if (tooltipFrame !== null) {
        return
      }

      tooltipFrame = requestAnimationFrame(() => {
        tooltipFrame = null

        const tooltip = pendingTooltip
        pendingTooltip = null

        if (!tooltip) {
          return
        }

        const current = get().tooltip

        if (!samePosition(current?.pos ?? null, tooltip.pos)) {
          set({ tooltip })
        }
      })
    },
    hideTooltip: () => {
      cancelPendingFrame()

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
      }

      // wait before removing. if we re-enter quickly, the tooltip won't flicker
      // as this timeout will be cancelled so the tooltip won't disappear
      // and will be moved to next location
      clearTimeoutId = setTimeout(() => {
        clearTimeoutId = null
        set({ tooltip: null })
      }, TOOLTIP_CLEAR_MS)
    },
    dispose: () => {
      cancelPendingFrame()

      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      set({ tooltip: null })
    },
  }
})

export function useTooltip() {
  const showTooltip = useTooltipStore((state) => state.showTooltip)
  const hideTooltip = useTooltipStore((state) => state.hideTooltip)

  return { showTooltip, hideTooltip }
}

// renders the active tooltip into a portal; doesn't need to wrap children
export function TooltipRenderer() {
  const tooltip = useTooltipStore((s) => s.tooltip)
  const dispose = useTooltipStore((s) => s.dispose)

  useEffect(() => dispose, [dispose])

  if (!tooltip) {
    return null
  }

  return createPortal(
    <BaseCol
      className={cn(
        'fixed z-(--z-tooltip) rounded-lg bg-black/50 shadow-lg px-4 py-3 text-xs text-white pointer-events-none',
        tooltip.className
      )}
      style={{
        left: tooltip.pos.x,
        top: tooltip.pos.y,
      }}
    >
      {tooltip.content}
    </BaseCol>,
    document.body
  )
}
