import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import * as d3 from 'd3'
import { ComponentProps, useEffect, useMemo, useRef } from 'react'
import { SvgBase, SvgCanvas } from './svg-base'

/**
 * Svg component with useful defaults set and a view box to match the width and height
 * @param param0
 * @returns
 */
export function SvgD3Canvas({
  children,
  ...props
}: ComponentProps<typeof SvgBase>) {
  const { ref: svgRef } = useSVG()

  const containerRef = useRef<SVGSVGElement | null>(null)

  // 1. Get store values
  const { zoom, limit, setZoom } = useZoom()

  // 2. Memoize the zoom behavior instance so it stays persistent
  const zoomBehavior = useMemo(() => {
    return d3
      .zoom()
      .scaleExtent([limit.min, limit.max])
      .filter((event) => {
        // If it's a wheel event, strictly require the Ctrl key
        if (event.type === 'wheel') {
          return event.shiftKey
        }
        // For all other events (like dragging to pan), use D3's default allowance rule
        return true // !event.ctrlKey && !event.button;
      })
      .on('zoom', (event) => {
        // Apply transform directly to the inner SVG group for smooth rendering
        d3.select(containerRef.current).attr('transform', event.transform)

        // Push changes up to store *only* if driven by user interaction (mouse/touch)
        // This completely prevents infinite update loops!
        //x: event.transform.x,
        //    y: event.transform.y,

        if (event.sourceEvent) {
          setZoom(event.transform.k)
        }
      })
  }, [setZoom])

  // 3. Bind listeners once on mount
  useEffect(() => {
    if (!svgRef.current) return
    d3.select(svgRef.current).call(zoomBehavior)
  }, [zoomBehavior])

  // 4. Sync External Store Changes smoothly back down into D3
  useEffect(() => {
    if (!svgRef.current) return

    //translate(x, y)
    const targetTransform = d3.zoomIdentity.scale(zoom)

    // Smoothly update D3's internal state using its native programmatic API.
    // .transform() handles all the underlying bookkeeping perfectly.
    d3.select(svgRef.current)
      .interrupt() // Stops active user pan animations to prevent jarring snaps
      .call(zoomBehavior.transform, targetTransform)
  }, [zoom, zoomBehavior])

  return (
    <SvgCanvas {...props}>
      <g ref={containerRef} id="d3-zoom">
        {children}
      </g>
    </SvgCanvas>
  )
}
