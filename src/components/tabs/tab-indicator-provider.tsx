import { type IRect } from '@/interfaces/rect'
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

// export interface ITabIndicatorPos {
//   rect: IRect
// }

export interface ITabIndicatorPos extends IRect {
  animate: boolean
  scale: number
  index: number
  tabs: number
}

const DEFAULT_TAB: ITabIndicatorPos = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  animate: true,
  scale: 1,
  index: 0,
  tabs: 0,
}

function posChanged(
  a: ITabIndicatorPos | undefined,
  b: ITabIndicatorPos | undefined
): boolean {
  if (a === b) return false
  if (!a || !b) return true
  return (
    a.x !== b.x ||
    a.y !== b.y ||
    a.w !== b.w ||
    a.h !== b.h ||
    a.scale !== b.scale
  )
}

interface ITabIndicatorContext {
  position: ITabIndicatorPos | undefined
  selectedPosition: ITabIndicatorPos | undefined
  setPosition: (pos: Partial<ITabIndicatorPos> | undefined) => void
  setSelectedPosition: (pos: Partial<ITabIndicatorPos> | undefined) => void
}

const TabIndicatorContext = createContext<ITabIndicatorContext | undefined>(
  undefined
)

export function TabIndicatorProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<ITabIndicatorPos | undefined>(
    undefined
  )
  const [selectedPosition, setSelectedPosition] = useState<
    ITabIndicatorPos | undefined
  >(undefined)

  const _setPosition = useCallback(
    (pos: Partial<ITabIndicatorPos> | undefined) => {
      setPosition((prev) => {
        if (!pos) {
          setPosition(undefined)
          return undefined
        }

        const newPos = prev ? { ...prev, ...pos } : { ...DEFAULT_TAB, ...pos }

        if (posChanged(prev, newPos)) {
          return newPos
        }

        // no change so we return previous state to avoid unnecessary re-renders
        return prev
      })
    },
    []
  )

  const _setSelectedPosition = useCallback(
    (pos: Partial<ITabIndicatorPos> | undefined) => {
      setSelectedPosition((prev) => {
        const newPos = pos
          ? prev
            ? { ...prev, ...pos }
            : { ...DEFAULT_TAB, ...pos }
          : undefined
        if (!posChanged(prev, newPos)) return prev
        return newPos
      })
    },
    []
  )

  return (
    <TabIndicatorContext.Provider
      value={{
        position,
        selectedPosition,
        setPosition: _setPosition,
        setSelectedPosition: _setSelectedPosition,
      }}
    >
      {children}
    </TabIndicatorContext.Provider>
  )
}

export function useTabIndicators() {
  const ctx = useContext(TabIndicatorContext)

  if (!ctx) {
    throw new Error(
      'useTabIndicators must be used within a TabIndicatorProvider'
    )
  }

  return ctx
}
