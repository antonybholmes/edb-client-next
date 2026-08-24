import { IChildrenProps } from '@/interfaces/children-props'
import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useRef,
} from 'react'

type ISvgRef = {
  ref: RefObject<SVGSVGElement | null>
  //setSVG: (svg: SVGSVGElement | null) => void
  registerSVG: (id: string, svg: SVGSVGElement | null) => void
}

const SVGContext = createContext<ISvgRef | null>(null)

export function useSVG() {
  const ctx = useContext(SVGContext)

  if (!ctx) {
    throw new Error('useSVG must be used within a SVGProvider')
  }

  return ctx
}

export function SVGProvider({ children }: IChildrenProps) {
  const ref = useRef<SVGSVGElement | null>(null)
  const activeId = useRef<string | null>(null)

  // const setSVG = useCallback((svg: SVGSVGElement | null) => {
  //   if (svg) {
  //     ref.current = svg
  //   }
  // }, [])

  const registerSVG = useCallback((id: string, svg: SVGSVGElement | null) => {
    if (svg) {
      activeId.current = id
      ref.current = svg
    } else if (activeId.current === id) {
      activeId.current = null
      ref.current = null
    }
  }, [])

  return (
    <SVGContext.Provider value={{ ref, registerSVG }}>
      {children}
    </SVGContext.Provider>
  )
}
