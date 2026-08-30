import { BaseCol } from '@/components/layout/base-col'
import { IPos } from '@/interfaces/pos'
import { ReactNode } from 'react'

import { createPortal } from 'react-dom'
import { create } from 'zustand'

export const TOOLTIP_CLEAR_MS = 300

export interface ITooltipState {
  pos: IPos
  content: ReactNode
}

interface ITooltipStore {
  tooltip: ITooltipState | null
  showTooltip: (tooltip: ITooltipState) => void
  hideTooltip: () => void
}

// module-level so it survives across calls without needing a ref in a component
let clearTimeoutId: ReturnType<typeof setTimeout> | null = null

export const useTooltipStore = create<ITooltipStore>()((set, get) => ({
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
    clearTimeoutId = setTimeout(() => set({ tooltip: null }), TOOLTIP_CLEAR_MS)
  },
}))

export const useTooltip = () => {
  const showTooltip = useTooltipStore((s) => s.showTooltip)
  const hideTooltip = useTooltipStore((s) => s.hideTooltip)

  return { showTooltip, hideTooltip }
}

// renders the active tooltip into a portal; doesn't need to wrap children
export function TooltipRenderer() {
  const tooltip = useTooltipStore((s) => s.tooltip)

  if (!tooltip) {
    return null
  }

  return createPortal(
    <BaseCol
      className="fixed z-(--z-tooltip) rounded-theme bg-black/60 p-3 text-xs text-white"
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
