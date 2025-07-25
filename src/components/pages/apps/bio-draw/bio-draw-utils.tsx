import type { IPos } from '@/interfaces/pos'
import type { RefObject } from 'react'

export function getMouseSVGCoords(
  svgRef: RefObject<SVGSVGElement | null>,
  e: MouseEvent | React.MouseEvent
) {
  const svg = svgRef.current

  if (!svg) {
    return { x: 0, y: 0 }
  }

  const pt = svg.createSVGPoint()
  pt.x = e.clientX
  pt.y = e.clientY
  return pt.matrixTransform(svg.getScreenCTM()?.inverse())
}

export interface IPoint extends IPos {
  type: 'control' | 'inter'
  d: number
  //index: number
}

export type ExportedState = {
  type: 'lipid'
  id: string
  points: IPoint[]
}

export type ExportHandle = {
  exportState: () => ExportedState
}
