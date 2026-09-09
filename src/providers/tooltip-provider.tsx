import { BaseCol } from '@/components/layout/base-col'
import { IPos } from '@/interfaces/pos'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode, useCallback, useEffect, useRef } from 'react'

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
}

export const useTooltipStore = create<ITooltipStore>()((set, get) => {
  // module-level so it survives across calls without needing a ref in a component
  let clearTimeoutId: ReturnType<typeof setTimeout> | null = null

  return {
    tooltip: null,
    showTooltip: (t) => {
      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
        clearTimeoutId = null
      }

      const { tooltip } = get()

      if (!tooltip || tooltip.pos.x !== t.pos.x || tooltip.pos.y !== t.pos.y) {
        set({ tooltip: t })
      }
    },
    hideTooltip: () => {
      if (clearTimeoutId) {
        clearTimeout(clearTimeoutId)
      }

      // wait before removing. if we re-enter quickly, the tooltip won't flicker
      // as this timeout will be cancelled so the tooltip won't disappear
      // and will be moved to next location
      clearTimeoutId = setTimeout(
        () => set({ tooltip: null }),
        TOOLTIP_CLEAR_MS
      )
    },
  }
})

export function useTooltip() {
  const showTooltip = useTooltipStore((s) => s.showTooltip)
  const hideTooltip = useTooltipStore((s) => s.hideTooltip)

  const tooltipFrame = useRef<number | null>(null)
  const pendingTooltip = useRef<ITooltipState | null>(null)

  useEffect(() => {
    return () => {
      pendingTooltip.current = null

      if (tooltipFrame.current !== null) {
        cancelAnimationFrame(tooltipFrame.current)
      }
    }
  }, [])

  const updateTooltip = useCallback(
    (tooltip: ITooltipState) => {
      pendingTooltip.current = tooltip

      if (tooltipFrame.current !== null) {
        return
      }

      tooltipFrame.current = requestAnimationFrame(() => {
        tooltipFrame.current = null

        if (pendingTooltip.current) {
          showTooltip(pendingTooltip.current)
          pendingTooltip.current = null
        }
      })
    },
    [showTooltip]
  )

  const _hideTooltip = useCallback(() => {
    if (tooltipFrame.current !== null) {
      cancelAnimationFrame(tooltipFrame.current)
      tooltipFrame.current = null
    }

    pendingTooltip.current = null
    hideTooltip()
  }, [hideTooltip])

  return { showTooltip: updateTooltip, hideTooltip: _hideTooltip }
}

// renders the active tooltip into a portal; doesn't need to wrap children
export function TooltipRenderer() {
  const tooltip = useTooltipStore((s) => s.tooltip)

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
