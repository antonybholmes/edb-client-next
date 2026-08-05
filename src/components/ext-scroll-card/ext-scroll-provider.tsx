import { IChildrenProps } from '@/interfaces/children-props'
import type { IDim } from '@/interfaces/dim'
import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react'
import type { IScrollPosition } from './ext-scrollbars'

export interface IScrollOffset {
  left: number
  top: number
}

interface ExtScrollRefsContextProps {
  vScrollRef: RefObject<HTMLDivElement | null>
  hScrollRef: RefObject<HTMLDivElement | null>
}

interface ExtScrollStateContextProps {
  size: IDim
  scrollLeft: IScrollPosition
  scrollTop: IScrollPosition
  scrollOffset: IScrollOffset
  setSize: (size: IDim) => void
  setScrollLeft: (p: IScrollPosition) => void
  setScrollTop: (p: IScrollPosition) => void
}

const ExtScrollRefsContext = createContext<ExtScrollRefsContextProps>({
  vScrollRef: { current: null },
  hScrollRef: { current: null },
})

const ExtScrollStateContext = createContext<ExtScrollStateContextProps>({
  size: { w: 0, h: 0 },
  scrollLeft: { p: 0, normalized: 0 },
  scrollTop: { p: 0, normalized: 0 },
  scrollOffset: { left: 0, top: 0 },

  setSize: () => {},
  setScrollLeft: () => {},
  setScrollTop: () => {},
})

export function useExtScrollRefsContext() {
  const ctx = useContext(ExtScrollRefsContext)
  if (!ctx) {
    throw new Error(
      'useExtScrollRefsContext must be used within a ExtScrollProvider'
    )
  }
  return ctx
}

export function useExtScrollStateContext() {
  const ctx = useContext(ExtScrollStateContext)
  if (!ctx) {
    throw new Error(
      'useExtScrollStateContext must be used within a ExtScrollProvider'
    )
  }
  return ctx
}

// export function useExtScrollContext() {
//   return {
//     ...useExtScrollRefsContext(),
//     ...useExtScrollStateContext(),
//   }
// }

export function ExtScrollProvider({ children }: IChildrenProps) {
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

  const refsValue = useMemo<ExtScrollRefsContextProps>(() => {
    return {
      vScrollRef,
      hScrollRef,
    }
  }, [])

  const stateValue = useMemo<ExtScrollStateContextProps>(() => {
    return {
      scrollLeft,
      scrollTop,
      scrollOffset,
      size,
      setSize,
      setScrollTop,
      setScrollLeft,
    }
  }, [scrollLeft, scrollTop, scrollOffset, size])

  return (
    <ExtScrollRefsContext.Provider value={refsValue}>
      <ExtScrollStateContext.Provider value={stateValue}>
        {children}
      </ExtScrollStateContext.Provider>
    </ExtScrollRefsContext.Provider>
  )
}
