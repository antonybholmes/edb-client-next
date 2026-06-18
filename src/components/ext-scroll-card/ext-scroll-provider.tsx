import type { IDim } from '@/interfaces/dim'
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react'
import type { IScrollPosition } from './ext-scrollbars'

export interface IScrollOffset {
  left: number
  top: number
}

interface ExtScrollCardContextProps {
  vScrollRef: RefObject<HTMLDivElement | null>
  hScrollRef: RefObject<HTMLDivElement | null>

  size: IDim
  scrollLeft: IScrollPosition
  scrollTop: IScrollPosition
  scrollOffset: IScrollOffset
  setSize: (size: IDim) => void
  setScrollLeft: (p: IScrollPosition) => void
  setScrollTop: (p: IScrollPosition) => void
}

const ExtScrollContext = createContext<ExtScrollCardContextProps>({
  vScrollRef: { current: null },
  hScrollRef: { current: null },

  size: { w: 0, h: 0 },
  scrollLeft: { p: 0, normalized: 0 },
  scrollTop: { p: 0, normalized: 0 },
  scrollOffset: { left: 0, top: 0 },

  setSize: () => {},
  setScrollLeft: () => {},
  setScrollTop: () => {},
})

export function useExtScrollContext() {
  const ctx = useContext(ExtScrollContext)
  if (!ctx) {
    throw new Error(
      'useExtScrollContext must be used within a ExtScrollProvider'
    )
  }
  return ctx
}

interface ExtScrollProviderProps {
  children: ReactNode
}

export function ExtScrollProvider({ children }: ExtScrollProviderProps) {
  const hScrollRef = useRef<HTMLDivElement>(null)
  const vScrollRef = useRef<HTMLDivElement>(null)

  const [size, setSize] = useState<IDim>({ w: 0, h: 0 })

  const [scrollTop, setScrollTop] = useState<IScrollPosition>({
    p: 0,
    normalized: 0,
  })

  const [scrollLeft, setScrollLeft] = useState<IScrollPosition>({
    p: 0,
    normalized: 0,
  })

  const scrollOffset = useMemo<IScrollOffset>(() => {
    return {
      left: scrollLeft.normalized * size.w,
      top: scrollTop.normalized * size.h,
    }
  }, [scrollLeft, scrollTop, size])

  return (
    <ExtScrollContext.Provider
      value={{
        vScrollRef,
        hScrollRef,

        scrollLeft,
        scrollTop,
        scrollOffset,
        size,

        setSize,
        setScrollTop,
        setScrollLeft,
      }}
    >
      {children}
    </ExtScrollContext.Provider>
  )
}
