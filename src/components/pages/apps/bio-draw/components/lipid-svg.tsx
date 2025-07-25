import type { IBox, IPos } from '@/interfaces/pos'

import {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type RefObject,
} from 'react'
import { svgPathProperties } from 'svg-path-properties'
import {
  getMouseSVGCoords,
  type ExportHandle,
  type IPoint,
} from '../bio-draw-utils'
import { BoundingBoxSvg } from './bounding-box'

// export interface IDisplayProps {
//   plotHeight: number
//   letterWidth: number
//   mode: Mode
//   zoom: number
//   margin: IMarginProps
//   baseColors: { [K in DNABase]: string }
//   titleOffset: number
//   gap: number
//   revComp: boolean
// }

// export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
//   plotHeight: 100,
//   letterWidth: LW,
//   zoom: 1,
//   mode: 'Bits',
//   gap: 80,
//   margin: { top: 100, right: 100, bottom: 100, left: 100 },
//   baseColors: {
//     a: '#3cb371',
//     c: '#FFA500',
//     g: '#4169e1',
//     t: '#ff0000',
//   },
//   titleOffset: 10,
//   revComp: false,
// }

// interface IProps extends IDivProps {
//   displayProps?: IDisplayProps
// }

export interface ILipid {
  id: string
  points: IPoint[]
}

const PADDING = 10

const DELTA = 0.001

interface IProps {
  lipid: ILipid
  svgRef: RefObject<SVGSVGElement | null>
  exportRef: RefObject<ExportHandle | null>
  defaultPoints?: IPoint[]
}

export function LipidSvg({ svgRef, exportRef, lipid }: IProps) {
  const pathRef = useRef<SVGPathElement>(null)
  const points = useRef<IPoint[]>(lipid.points)
  //const interPoints = useRef<IPoint[]>([])

  const angles = useRef<{ angle: number; above: IPos; below: IPos }[]>([])

  const [d, setD] = useState('')
  const [showBox, setShowBox] = useState(false)
  const bbox = useRef<IBox | null>(null)

  const paddedBBox = useRef<IBox | null>(null)

  const draggingIdx = useRef<number | null>(null)

  const frame = useRef<number | null>(null)

  const resizeDragging = useRef<{
    mouseStart: IPos | DOMPoint
    originalPoints: IPoint[]
    originalBBox: IBox | null
    //anchor: IPos
    direction: string
  } | null>(null)

  useImperativeHandle(exportRef, () => ({
    exportState: () => ({
      type: 'lipid',
      id: lipid.id,
      points: [...points.current],
    }), // make sure to return a copy
  }))

  const handleMouseDown = (index: number, pt: IPoint) => {
    if (pt.type === 'control') {
      draggingIdx.current = index
    } else {
      // we click on an inter point and convert it to control
      // and add an inter point either side of the new control
      // point, thus the path gets progressively more complex
      // as user fiddles with it
      let newPoints = points.current.slice(0, index)

      newPoints.push({
        x: -1,
        y: -1,
        type: 'inter',
        d: (pt.d + points.current[index - 1]!.d) / 2,
      })

      newPoints.push({ ...pt, type: 'control' })

      newPoints.push({
        x: -1,
        y: -1,
        type: 'inter',
        d: (pt.d + points.current[index + 1]!.d) / 2,
      })

      newPoints.push(...points.current.slice(index + 1))

      updatePoints(newPoints)

      const d = getCatmullRomSplinePath(newPoints)

      updatePathD(d)

      draggingIdx.current = index + 1
    }
  }

  const updateBBox = () => {
    const controlPoints = points.current.filter(p => p.type === 'control')

    const xs = controlPoints.map(p => p.x)
    const ys = controlPoints.map(p => p.y)
    const x = Math.min(...xs)
    const y = Math.min(...ys)
    const width = Math.max(...xs) - x
    const height = Math.max(...ys) - y

    bbox.current = { x: x, y: y, width: width, height: height }

    paddedBBox.current = {
      x: x - PADDING,
      y: y - PADDING,
      width: width + PADDING * 2,
      height: height + PADDING * 2,
    }

    //const padding = 6
    // setBBox({
    //   x: x - padding,
    //   y: y - padding,
    //   width: width + padding * 2,
    //   height: height + padding * 2,
    // })
  }

  function updatePoints(newPoints: IPoint[]) {
    points.current = newPoints
    updateBBox()
  }

  //useEffect(updateBBox, [points])

  function updatePathD(splinePathD: string) {
    const properties = new svgPathProperties(splinePathD)

    const l = properties.getTotalLength()

    for (let i = 0; i < points.current.length; i++) {
      const pt = points.current[i]!
      if (pt.type === 'inter') {
        const point = properties.getPointAtLength(pt.d * l)
        points.current[i]!.x = point.x
        points.current[i]!.y = point.y
      }
    }

    //setInterPoints(newPoints)

    // we can get the properties of the line with this lib so we
    // don't need the ref which helps reduce rendering inconsistencies

    const len = properties.getTotalLength()

    const n = Math.floor(len / 10)

    const newAngles = Array.from({ length: n }).map((_, i) => {
      const posLen = (i / (n - 1)) * len

      const pos = properties.getPointAtLength(posLen)
      const behind = properties.getPointAtLength(Math.max(posLen - DELTA, 0))
      const ahead = properties.getPointAtLength(Math.min(posLen + DELTA, len)) // tiny delta for angle

      const tangent = { x: ahead.x - behind.x, y: ahead.y - behind.y }

      const angle = Math.atan2(tangent.y, tangent.x) * (180 / Math.PI)

      const normal = {
        x: -tangent.y,
        y: tangent.x,
      }

      const normLen = Math.hypot(normal.x, normal.y)
      const unitNormal = {
        x: normal.x / normLen,
        y: normal.y / normLen,
      }

      const offset = -2
      const center = { x: pos.x, y: pos.y }
      const totalOffset = offset - 24
      const above = {
        x: center.x + unitNormal.x * totalOffset,
        y: center.y + unitNormal.y * totalOffset,
      }
      const below = {
        x: center.x - unitNormal.x * offset,
        y: center.y - unitNormal.y * offset,
      }

      return {
        above,
        below,
        angle,
      }
    })

    for (let i = 1; i < newAngles.length; i++) {
      const prev = newAngles[i - 1]!.angle

      let delta = newAngles[i]!.angle - prev

      // unwrap discontinuity when angles suddenly jump.
      // we compare ourselves to the previous point and
      // if the delta is high > 180 we assume the angle
      // flipped when calculating the tangent so we
      // correct it.
      if (delta > 180) {
        newAngles[i]!.angle -= 360
      } else if (delta < -180) {
        newAngles[i]!.angle += 360
      }
    }

    console.log(newAngles)
    angles.current = newAngles

    //console.log('rebound')
    //const box = pathRef.current.getBBox()
    // setBBox(box)

    if (frame.current === null) {
      // smoother animations since we don't overload
      // the state update with excessive calls on every
      // mouse move
      frame.current = requestAnimationFrame(() => {
        // ✅ multiple setState calls — batched
        setD(splinePathD)
        frame.current = null
      })
    }
  }

  const handleMouseDownResize = (
    e: MouseEvent | React.MouseEvent,
    direction: string
  ) => {
    e.preventDefault()
    const mouse = getMouseSVGCoords(svgRef, e)

    // const offsetX = direction.includes('e')
    //   ? -PADDING
    //   : direction.includes('w')
    //     ? PADDING
    //     : 0

    // const offsetY = direction.includes('n')
    //   ? PADDING
    //   : direction.includes('s')
    //     ? -PADDING
    //     : 0

    // const logicalMouse = {
    //   x: mouse.x + offsetX,
    //   y: mouse.y + offsetY,
    // }

    console.log(direction)

    resizeDragging.current = {
      mouseStart: mouse,
      originalPoints: [...points.current],
      originalBBox: bbox.current ? { ...bbox.current } : null,
      //anchor,
      direction,
    }
  }

  const handleMouseMoveResize = (e: MouseEvent) => {
    const mouse = getMouseSVGCoords(svgRef, e)

    if (draggingIdx.current) {
      const newPoints = [...points.current]
      newPoints[draggingIdx.current] = {
        ...points.current[draggingIdx.current]!,
        x: mouse.x,
        y: mouse.y,
      }

      //updateInterPoints(newPoints)

      updatePoints(newPoints)

      const d = getCatmullRomSplinePath(newPoints)

      updatePathD(d)
    }

    if (paddedBBox.current) {
      // we want some padding outside the box we show
      const within =
        mouse.x >= paddedBBox.current.x - PADDING &&
        mouse.x <= paddedBBox.current.x + paddedBBox.current.width + PADDING &&
        mouse.y >= paddedBBox.current.y - PADDING &&
        mouse.y <= paddedBBox.current.y + paddedBBox.current.height + PADDING

      setShowBox(draggingIdx.current !== null || within)
    }

    if (resizeDragging.current && bbox.current) {
      const { mouseStart, direction, originalPoints, originalBBox } =
        resizeDragging.current

      // const offsetX = direction.includes('e')
      //   ? -PADDING
      //   : direction.includes('w')
      //     ? PADDING
      //     : 0

      // const offsetY = direction.includes('n')
      //   ? PADDING
      //   : direction.includes('s')
      //     ? -PADDING
      //     : 0

      // console.log(direction, offsetX, offsetY)

      // const logicalMouse = {
      //   x: mouse.x + offsetX,
      //   y: mouse.y + offsetY,
      // }

      const dx = mouse.x - mouseStart.x
      const dy = mouse.y - mouseStart.y

      //const centerX = bbox.x + bbox.width / 2
      //const centerY = bbox.y + bbox.height / 2

      /* const newPoints = originalPoints.map(p => {
        let x = p.x
        let y = p.y
  
        if (direction.includes('e') && p.x >= centerX) x += dx
        if (direction.includes('w') && p.x < centerX) x += dx
        if (direction.includes('n') && p.y < centerY) y += dy
        if (direction.includes('s') && p.y >= centerY) y += dy
  
        return { ...p, x, y }
      }) */

      let newPoints: IPoint[] = []

      console.log(direction, 'c')

      if (direction === 'move') {
        newPoints = originalPoints.map(p => ({
          ...p,
          x: p.x + dx,
          y: p.y + dy,
        }))
      } else {
        const scaleX = direction.includes('e')
          ? (originalBBox!.width + dx) / originalBBox!.width
          : direction.includes('w')
            ? (originalBBox!.width - dx) / originalBBox!.width
            : 1

        const scaleY = direction.includes('s')
          ? (originalBBox!.height + dy) / originalBBox!.height
          : direction.includes('n')
            ? (originalBBox!.height - dy) / originalBBox!.height
            : 1

        const anchorX = direction.includes('w')
          ? originalBBox!.x + originalBBox!.width
          : originalBBox!.x
        const anchorY = direction.includes('n')
          ? originalBBox!.y + originalBBox!.height
          : originalBBox!.y

        //console.log(dx, dy)

        newPoints = originalPoints.map(p => ({
          ...p,
          x: anchorX + (p.x - anchorX) * scaleX,
          y: anchorY + (p.y - anchorY) * scaleY,
        }))
      }

      const d = getCatmullRomSplinePath(newPoints)

      updatePoints(newPoints)

      updatePathD(d)
    }
  }

  // function applyScaleTransform(p: IPos): IPos {
  //   const tx = scale.anchorX + (p.x - scale.anchorX) * scale.scaleX
  //   const ty = scale.anchorY + (p.y - scale.anchorY) * scale.scaleY
  //   return { x: tx, y: ty }
  // }

  const handleMouseUpResize = () => {
    draggingIdx.current = null
    resizeDragging.current = null
    //setStart(null)
  }

  useEffect(() => {
    const controlPoints = arcThroughRect(100, 100, 400, 100, 5)

    updatePoints(controlPoints) //.filter(pt => pt.type === 'control'))

    //setInterPoints(controlPoints.filter(pt => pt.type === 'inter'))

    const d = getCatmullRomSplinePath(controlPoints)
    updatePathD(d)
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUpResize)
    window.addEventListener('mousemove', handleMouseMoveResize)

    return () => {
      window.removeEventListener('mouseup', handleMouseUpResize)
      window.removeEventListener('mousemove', handleMouseMoveResize)
    }
  }, [])

  // const cubicBezier = (
  //   p0: IPos,
  //   p1: IPos,
  //   p2: IPos,
  //   p3: IPos,
  //   t: number
  // ): IPos => {
  //   const u = 1 - t
  //   const tt = t * t
  //   const uu = u * u
  //   const uuu = uu * u
  //   const ttt = tt * t

  //   const p = {
  //     x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
  //     y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  //   }
  //   return p
  // }

  // const quadraticBezier = (p0: IPos, p1: IPos, p2: IPos, t: number): IPos => {
  //   const u = 1 - t
  //   const tt = t * t
  //   const uu = u * u

  //   return {
  //     x: uu * p0.x + 2 * u * t * p1.x + tt * p2.x,
  //     y: uu * p0.y + 2 * u * t * p1.y + tt * p2.y,
  //   }
  // }

  // Generate a smooth spline using Catmull-Rom to Bezier conversion
  // somewhat similar to https://github.com/ariutta/catmullrom2bezier/blob/master/catmullrom2bezier.js
  // https://pomax.github.io/bezierinfo/#catmullconv
  function getCatmullRomSplinePath(pts: IPoint[], tension: number = 1) {
    pts = pts.filter(pt => pt.type === 'control')

    const F = 6 * tension

    if (pts.length < 2) return ''

    let d = `M ${pts[0]!.x} ${pts[0]!.y}`

    for (let i = 0; i < pts.length - 1; i++) {
      const p1 = pts[Math.max(0, i - 1)]!
      const p2 = pts[i]!
      const p3 = pts[i + 1]!
      const p4 = pts[Math.min(pts.length - 1, i + 2)]!

      const cp1 = { x: p2.x + (p3.x - p1.x) / F, y: p2.y + (p3.y - p1.y) / F }

      const cp2 = { x: p3.x - (p4.x - p2.x) / F, y: p3.y - (p4.y - p2.y) / F }

      d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${p3.x} ${p3.y}`
    }

    return d
  }

  // const getSplineQuadPath = (pts: IPoint[]) => {
  //   pts = pts.filter(pt => pt.type === 'control')

  //   if (pts.length < 2) return ''
  //   let d = `M ${pts[0]!.x} ${pts[0]!.y}`

  //   const results: { start: IPos; control: IPos; end: IPos }[] = []

  //   for (let i = 0; i < pts.length - 1; i++) {
  //     const p1 = pts[Math.max(0, i - 1)]!
  //     const p2 = pts[i]!
  //     const p3 = pts[i + 1]!
  //     //const p3 = pts[Math.min(pts.length - 1, i + 2)]!

  //     const control: IPos = {
  //       x: (6 * p2.x - p1.x + p3.x) / 6,
  //       y: (6 * p2.y - p1.y + p3.y) / 6,
  //     }

  //     results.push({ start: p2, control, end: p3 })
  //   }
  //   for (const seg of results) {
  //     d += ` Q ${seg.control.x} ${seg.control.y} ${seg.end.x} ${seg.end.y}`
  //   }

  //   return d
  // }

  // const sampleSpline = (numSamples: number) => {
  //   if (!pathRef.current) return [] // Ensure the path is available

  //   const d = pathRef.current.getAttribute('d')
  //   if (!d) return

  //   const properties = svgPathProperties(d)

  //   const length = pathRef.current.getTotalLength()
  //   const sampledPoints: IPos[] = []
  //   for (let i = 1; i <= numSamples; i += 1) {
  //     const distance = (i / numSamples) * length
  //     const point = properties.getPointAtLength(distance)
  //     sampledPoints.push({ x: point.x, y: point.y })
  //   }
  //   return sampledPoints
  // }

  // const updateInterPointsAlongSpline = (d: string, points: IPoint[]) => {
  //   const properties = new svgPathProperties(d)

  //   const l = properties.getTotalLength()

  //   for (let i = 0; i < points.length; i++) {
  //     const pt = points[i]!
  //     if (pt.type === 'inter') {
  //       const point = properties.getPointAtLength(pt.d * l)
  //       points[i]!.x = point.x
  //       points[i]!.y = point.y
  //     }
  //   }

  //   interPoints.current = points
  // }

  // const calculateMidpoints = (points: IPos[]) => {
  //   const midpoints: IPos[] = []
  //   for (let i = 0; i < points.length - 1; i++) {
  //     const p0 = points[i]!
  //     const p1 = points[i + 1]!
  //     // Calculate midpoint between the two control points
  //     const midpoint = {
  //       x: (p0.x + p1.x) / 2,
  //       y: (p0.y + p1.y) / 2,
  //     }
  //     midpoints.push(midpoint)
  //   }
  //   return midpoints
  // }

  // const calculateMidpointsOnCurve = (
  //   points: IPos[],
  //   numSamples: number = 4
  // ) => {
  //   const midpoints: IPos[] = []

  //   for (let i = 0; i < points.length - 3; i++) {
  //     const p0 = points[i]!
  //     const p1 = points[i + 1]!
  //     const p2 = points[i + 2]!
  //     const p3 = points[i + 3]!

  //     // Calculate midpoints at specific 't' values (e.g., 0.25, 0.5, 0.75)
  //     for (let t = 0.25; t <= 1; t += 0.25) {
  //       const point = cubicBezier(p0, p1, p2, p3, t)
  //       midpoints.push(point)
  //     }
  //   }

  //   return midpoints
  // }

  // const calculateMidpointsOnCurveQuad = (
  //   points: IPos[],
  //   numSamples: number = 4
  // ): IPos[] => {
  //   const midpoints: IPos[] = []

  //   const p0 = points[0]!
  //   const p1 = points[1]!
  //   const p2 = points[2]!

  //   // We will sample t at intervals such as 0.25, 0.5, 0.75 to get midpoints
  //   const step = 1 / numSamples

  //   for (let i = 1; i < numSamples; i++) {
  //     const t = step * i
  //     const pointOnCurve = quadraticBezier(p0, p1, p2, t)
  //     midpoints.push(pointOnCurve)
  //   }

  //   return midpoints
  // }

  // Calculate the point on the circle at a given angle
  // const pointOnCircle = (center: IPos, radius: number, angle: number): IPos => {
  //   return {
  //     x: center.x + radius * Math.cos(angle),
  //     y: center.y + radius * Math.sin(angle),
  //   }
  // }

  // function pointsOnCircle(
  //   cx: number,
  //   cy: number,
  //   radius: number,
  //   count: number
  // ): IPos[] {
  //   const points: IPos[] = []
  //   const step = (2 * Math.PI) / count

  //   for (let i = 0; i < count; i++) {
  //     const angle = i * step
  //     const x = cx + radius * Math.cos(angle)
  //     const y = cy + radius * Math.sin(angle)
  //     points.push({ x, y })
  //   }

  //   return points
  // }

  // function pointsOnArc(
  //   cx: number,
  //   cy: number,
  //   radius: number,
  //   startAngle: number,
  //   endAngle: number,
  //   count: number
  // ): IPos[] {
  //   const points: IPos[] = []
  //   const angleStep = (endAngle - startAngle) / (count - 1)

  //   for (let i = 0; i < count; i++) {
  //     const angle = startAngle + i * angleStep
  //     points.push({
  //       x: cx + radius * Math.cos(angle),
  //       y: cy + radius * Math.sin(angle),
  //     })
  //   }

  //   return points
  // }

  // Calculate control points for approximating an arc with a cubic Bézier curve
  // const cubicBezierForArc = (
  //   center: IPos,
  //   radius: number,
  //   startAngle: number,
  //   endAngle: number,
  //   tension: number = 0.2
  // ): IPos[] => {
  //   // Start and end points of the arc
  //   const P0 = pointOnCircle(center, radius, startAngle)
  //   const P3 = pointOnCircle(center, radius, endAngle)

  //   // Tangents at P0 and P3
  //   const tangentStart = { x: -Math.sin(startAngle), y: Math.cos(startAngle) } // Perpendicular vector to radius at P0
  //   const tangentEnd = { x: -Math.sin(endAngle), y: Math.cos(endAngle) } // Perpendicular vector to radius at P3

  //   // Control points P1 and P2 are placed along the tangents at a distance controlled by the 'tension'
  //   const P1: IPos = {
  //     x: P0.x + tangentStart.x * radius * tension,
  //     y: P0.y + tangentStart.y * radius * tension,
  //   }
  //   const P2: IPos = {
  //     x: P3.x + tangentEnd.x * radius * tension,
  //     y: P3.y + tangentEnd.y * radius * tension,
  //   }

  //   return [P0, P1, P2, P3]
  // }

  function arcThroughRect(
    x: number,
    y: number,
    width: number,
    height: number,
    count: number
  ): IPoint[] {
    const x1 = x
    const x2 = x + width
    const y1 = y // top of rect
    const y2 = y + height // bottom of rect

    const d = x2 - x1 // chord width
    const h = y2 - y1 // arc height (sagitta)

    const r = h / 2 + (d * d) / (8 * h) // circle radius
    const cx = (x1 + x2) / 2 // circle center x
    const cy = y2 + r // circle center y (since arc is upward)

    const p1 = { x: x1, y: y2 }
    const p2 = { x: x2, y: y2 }

    const startAngle = Math.atan2(p1.y - cy, p1.x - cx)
    const endAngle = Math.atan2(p2.y - cy, p2.x - cx)

    const points: IPoint[] = []
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1)
      const angle = startAngle + t * (endAngle - startAngle)
      points.push({
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
        type: i % 2 === 0 ? 'control' : 'inter',
        d: t,
      })
    }

    return points
  }

  //console.log('rep check')

  return (
    <>
      <defs>
        <g id="lipid">
          <path
            d="M 6,10 A 6,22 0 0 1 1,22"
            stroke="lightslategray"
            strokeOpacity={0.5}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <path
            d="M 8,10 L 8,22"
            stroke="lightslategray"
            strokeOpacity={0.5}
            fill="none"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <circle r={4} cx={7} cy={5} fill="cornflowerblue" fillOpacity={0.5} />
        </g>
      </defs>

      <>
        {angles.current.map((p, i) => {
          return (
            <g
              key={i}
              transform={`translate(${p.below.x}, ${p.below.y}) rotate(${p.angle})`}
            >
              <use href="#lipid" transform="scale(1 -1) translate(0 -24)" />
            </g>
          )
        })}
      </>

      <>
        {angles.current.map((p, i) => {
          return (
            <g
              key={i}
              transform={`translate(${p.above.x}, ${p.above.y}) rotate(${p.angle})`}
            >
              <use href="#lipid" />
            </g>
          )
        })}
      </>

      {/* Spline path */}
      <path
        ref={pathRef}
        d={d}
        stroke="black"
        fill="none"
        strokeWidth={2}
        vectorEffect="non-scaling-stroke"
      />

      {showBox && paddedBBox.current && (
        <BoundingBoxSvg
          bbox={paddedBBox.current}
          handleMouseDown={handleMouseDownResize}
        />
      )}

      {/* {interPoints.current.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={6}
          fill="white"
          stroke="cornflowerblue"
          onMouseDown={e => {
            e.stopPropagation()
            handleMouseDown(i, pt)
          }}
          style={{ cursor: 'pointer' }}
          //transform={transform}
          //vectorEffect="non-scaling-stroke"
        />
      ))} */}

      {/* Control points */}
      {points.current.map((pt, i) => (
        <circle
          key={i}
          cx={pt.x}
          cy={pt.y}
          r={5}
          fill={pt.type === 'control' ? 'cornflowerblue' : 'white'}
          stroke="cornflowerblue"
          strokeWidth={2}
          onMouseDown={e => {
            e.stopPropagation()
            handleMouseDown(i, pt)
          }}
          style={{ cursor: 'pointer' }}
          //transform={transform}
          //vectorEffect="non-scaling-stroke"
        />
      ))}

      {/* {sampleSpline(points.length * 2 - 1).map((midpoint, i) => (
          <circle
            key={`midway-${i}`}
            cx={midpoint.x}
            cy={midpoint.y}
            r={4}
            fill="orange"
            stroke="black"
          />
        ))} */}

      {/* {calculateMidpoints(points).map((midpoint, i) => (
          <circle
            key={`midway-${i}`}
            cx={midpoint.x}
            cy={midpoint.y}
            r={4}
            fill="orange"
            stroke="black"
          />
        ))} */}

      {/* {calculateMidpointsOnCurve(points).map((midpoint, i) => (
          <circle
            key={`midway-${i}`}
            cx={midpoint.x}
            cy={midpoint.y}
            r={4}
            fill="orange"
            stroke="black"
          />
        ))} */}
    </>
  )
}
