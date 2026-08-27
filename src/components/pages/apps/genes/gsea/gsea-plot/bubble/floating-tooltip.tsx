import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

type FloatingTooltipProps = {
  x: number
  y: number
  children: React.ReactNode
}

export function FloatingTooltip({ x, y, children }: FloatingTooltipProps) {
  const ref = useRef<HTMLDivElement>(null)

  const [position, setPosition] = useState({
    left: x + 12,
    top: y + 12,
  })

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const padding = 8

    let left = x + 12
    let top = y + 12

    // Keep tooltip inside viewport horizontally
    if (left + rect.width > window.innerWidth - padding) {
      left = x - rect.width - 12
    }

    // Keep tooltip inside viewport vertically
    if (top + rect.height > window.innerHeight - padding) {
      top = y - rect.height - 12
    }

    // Don't let it go off the left/top edge
    left = Math.max(padding, left)
    top = Math.max(padding, top)

    setPosition({ left, top })
  }, [x, y])

  return createPortal(
    <div
      ref={ref}
      className="fixed z-50 rounded-theme bg-black/60 p-3 text-xs text-white"
      style={{
        left: position.left,
        top: position.top,
      }}
    >
      {children}
    </div>,
    document.body
  )
}

type TooltipState = {
  x: number
  y: number
  content: React.ReactNode
} | null

type TooltipContextValue = {
  showTooltip: (tooltip: NonNullable<TooltipState>) => void
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
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const value = useMemo(
    () => ({
      showTooltip: setTooltip,
      hideTooltip: () => setTooltip(null),
    }),
    []
  )

  return (
    <TooltipContext.Provider value={value}>
      {children}

      {tooltip &&
        createPortal(
          <div
            className="fixed z-50 rounded-theme bg-black/60 p-3 text-xs text-white"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {tooltip.content}
          </div>,
          document.body
        )}
    </TooltipContext.Provider>
  )
}
