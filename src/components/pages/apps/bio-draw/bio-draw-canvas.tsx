import { makeUuid } from '@/lib/id'
import { createRef, useRef, type RefObject } from 'react'
import type { ExportHandle } from './bio-draw-utils'
import { LipidSvg, type ILipid } from './components/lipid-svg'

export function BioDrawSvg() {
  const svgRef = useRef<SVGSVGElement>(null)
  const exportRef = useRef<ExportHandle>(null)

  const childRefs = useRef<Array<RefObject<ExportHandle | null>>>(
    Array.from({ length: 1 }, () => createRef())
  )

  const lipid: ILipid = {
    id: makeUuid(),
    points: [],
  }

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="400px"
      style={{ border: '1px solid #ccc', background: '#fafafa' }}
    >
      <LipidSvg
        svgRef={svgRef}
        exportRef={childRefs.current[0]!}
        lipid={lipid}
      />
    </svg>
  )
}
