import { IPos } from '@/interfaces/pos'
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

export const TOOLTIP_CLEAR_MS = 300

interface ITooltipState {
  pos: IPos
  content: ReactNode
}

type TooltipContextValue = {
  showTooltip: (tooltip: ITooltipState) => void
  hideTooltip: () => void
}

const TooltipContext = createContext<TooltipContextValue | null>(null)

export const useTooltip = () => {
  const context = useContext(TooltipContext)
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider')
  }
  return context
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  const [tooltip, setTooltip] = useState<ITooltipState | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showTooltip = useCallback((t: ITooltipState) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (!tooltip || tooltip.pos.x !== t.pos.x || tooltip.pos.y !== t.pos.y) {
      setTooltip(t)
    }
  }, [])

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    timeoutRef.current = setTimeout(() => setTooltip(null), TOOLTIP_CLEAR_MS)
  }, [])

  const value = useMemo(
    () => ({
      showTooltip,
      hideTooltip,
    }),
    []
  )

  return (
    <TooltipContext.Provider value={value}>
      {children}

      {tooltip &&
        createPortal(
          <div
            className="fixed z-(--z-tooltip) rounded-theme bg-black/60 p-3 text-xs text-white"
            style={{
              left: tooltip.pos.x,
              top: tooltip.pos.y,
            }}
          >
            {tooltip.content}
          </div>,
          document.body
        )}
    </TooltipContext.Provider>
  )
}
