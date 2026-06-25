import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, RefObject, useContext, useRef } from 'react'

type ISvgRef = {
  svgRef: RefObject<SVGSVGElement | null>
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
  const svgRef = useRef<SVGSVGElement | null>(null)

  return (
    <SVGContext.Provider value={{ svgRef }}>{children}</SVGContext.Provider>
  )
}
