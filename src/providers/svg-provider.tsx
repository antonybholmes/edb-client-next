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

  /**
   * Registers an SVG element with the given ID, or unregisters it if the SVG is null.
   *
   * @param id The unique identifier for the SVG element being registered.
   * @param svg The SVG element to register, or null if it is being unregistered.
   * @returns void
   */
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
      // only unregister if the active ID matches the ID being unregistered.
      // this is stop tabs from unregistering an SVG that is not currently active.
      // e.g if tab A is active and tab B unregisters its SVG, tab A's SVG should
      // not be affected because of out of order unregistrations.
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
