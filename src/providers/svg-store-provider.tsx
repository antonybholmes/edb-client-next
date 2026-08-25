import { IChildrenProps } from '@/interfaces/children-props'
import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from 'react'

interface ISvgRef {
  ref: RefObject<SVGSVGElement | null>
  registerSVG: (id: string, svg: SVGSVGElement) => () => void
}

const SVGStoreContext = createContext<ISvgRef | null>(null)

export function useSVGStore() {
  const ctx = useContext(SVGStoreContext)

  if (!ctx) {
    throw new Error('useSVGStore must be used within a SVGStoreProvider')
  }

  return ctx
}

export function SVGStoreProvider({ children }: IChildrenProps) {
  const ref = useRef<SVGSVGElement | null>(null)
  const activeId = useRef<string | null>(null)

  const registerSVG = useCallback((id: string, svg: SVGSVGElement) => {
    activeId.current = id
    ref.current = svg

    return () => {
      console.log('Unregistering SVG with id:', id)
      //svgs.current.delete(id)

      if (activeId.current === id) {
        ref.current = null
        activeId.current = null
      }
    }
  }, [])

  return (
    <SVGStoreContext.Provider value={{ ref, registerSVG }}>
      {children}
    </SVGStoreContext.Provider>
  )
}
