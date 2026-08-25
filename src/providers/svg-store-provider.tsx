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
  getSVG: (id: string) => SVGSVGElement | null
  setActiveSVG: (id: string) => SVGSVGElement | null
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
  const svgs = useRef<Map<string, SVGSVGElement>>(new Map())

  const getSVG = useCallback((id: string) => {
    return svgs.current.get(id) || null
  }, [])

  const registerSVG = useCallback((id: string, svg: SVGSVGElement) => {
    activeId.current = id
    ref.current = svg
    svgs.current.set(id, svg)

    return () => {
      console.log('Unregistering SVG with id:', id)
      svgs.current.delete(id)

      if (activeId.current === id) {
        ref.current = null
        activeId.current = null
      }
    }
  }, [])

  const setActiveSVG = useCallback((id: string) => {
    const svg = svgs.current.get(id) || null
    if (svg) {
      activeId.current = id
      ref.current = svg
    }

    return svg
  }, [])

  return (
    <SVGStoreContext.Provider
      value={{ ref, registerSVG, getSVG, setActiveSVG }}
    >
      {children}
    </SVGStoreContext.Provider>
  )
}
