import { nanoid } from '@lib/utils'
import { createRef, useRef, type RefObject } from 'react'
import type { ExportHandle } from './bio-draw-utils'
import { LipidSvg, type ILipid } from './components/lipid-svg'

export function BioDrawSvg() {
  const svgRef = useRef<SVGSVGElement>(null)
  const exportRef = useRef<ExportHandle>(null)

  const childRefs = useRef<Array<RefObject<ExportHandle | null>>>(
    Array.from({ length: 1 }, () => createRef())
  )

  const handleExportAll = () => {
    const allStates = childRefs.current.map(ref => ref.current?.exportState())
    console.log('Exported states:', JSON.stringify(allStates))
  }

  const lipid: ILipid = {
    id: nanoid(),
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
