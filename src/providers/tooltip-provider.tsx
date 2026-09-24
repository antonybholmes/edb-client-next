import { BaseCol } from '@/components/layout/base-col'
import { IChildrenProps } from '@/interfaces/children-props'
import { IPos } from '@/interfaces/pos'
import { makeUuid } from '@/lib/id'
import { cn } from '@/lib/shadcn-utils'
import { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { create } from 'zustand'

export const TOOLTIP_CLEAR_MS = 300

export interface ITooltipState {
  id: string
  pos: IPos
  className?: string
  content: ReactNode
}

interface ITooltipStore {
  tooltip: ITooltipState | null
  showTooltip: (tooltip: Omit<ITooltipState, 'id'>) => void
  hideTooltip: () => void
  dispose: () => void
}

export function samePosition(a: IPos | null, b: IPos) {
  return a?.x === b.x && a?.y === b.y
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

  const clearPendingTimeout = () => {
    if (clearTimeoutId !== null) {
      clearTimeout(clearTimeoutId)
      clearTimeoutId = null
    }
  }

  return {
    tooltip: null,
    showTooltip: (t) => {
      const tooltip = { id: makeUuid(), ...t }
      // Cancel any pending tooltip frame before showing a new tooltip
      cancelPendingFrame()

      // Stop any existing tooltip clear timeout
      clearPendingTimeout()

      pendingTooltip = tooltip

      tooltipFrame = requestAnimationFrame(() => {
        tooltipFrame = null

        set({ tooltip: pendingTooltip })

        pendingTooltip = null
      })
    },
    hideTooltip: () => {
      cancelPendingFrame()

      clearPendingTimeout()

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

      clearPendingTimeout()

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
export function TooltipProvider({ children }: IChildrenProps) {
  const tooltip = useTooltipStore((s) => s.tooltip)

  //console.log('RENDER', tooltip)

  // useEffect(() => {
  //   //console.log('EFFECT MOUNT')

  //   return () => {
  //     console.log('EFFECT CLEANUP')
  //   }
  // }, [])

  return (
    <>
      {children && children}

      {tooltip &&
        createPortal(
          <BaseCol
            className={cn(
              'fixed z-(--z-tooltip) rounded-lg bg-black/60 shadow-lg px-4 py-3 text-xs text-white pointer-events-none',
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
        )}
    </>
  )
}
