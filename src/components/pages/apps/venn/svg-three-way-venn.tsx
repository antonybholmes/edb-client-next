import { DEG_TO_RAD, ILim } from '@/lib/math/math'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

interface ICountTextProps {
  id: string
  center: ILim
  overlapLabels: { [key: string]: { color: string; label: string } }
  setItems: (name: string, items: string[]) => void
}

export function CountText({
  id,
  center,
  overlapLabels,
  setItems,
}: ICountTextProps) {
  const { combinationNames, vennElemMap, originalNames } = useVenn()
  const { settings } = useVennSettings()
  const n = vennElemMap[id]?.length || 0
  const d = Object.keys(originalNames).length
  const p = (d > 0 ? (n / d) * 100 : 0).toFixed(1)
  const ref = useRef<SVGGElement | null>(null)
  const highlightRef = useRef(null)

  const [bbox, setBbox] = useState<DOMRect | null>(null)

  const [highlight, setHighlight] = useState(false)

  useEffect(() => {
    if (ref.current) {
      const box = ref.current.getBBox()
      setBbox(box)
    }
  }, [])

  useEffect(() => {
    if (highlight && bbox && highlightRef.current) {
      gsap.fromTo(
        highlightRef.current,
        { opacity: 0, scale: 0.8, transformOrigin: 'center center' },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power3.out' }
      )
    }
  }, [bbox, highlightRef, highlight])

  return (
    <>
      {highlight && bbox && (
        // <rect
        //   //ref={highlightRef}
        //   x={bbox.x - 8}
        //   y={bbox.y - 8}
        //   width={bbox.width + 16}
        //   height={bbox.height + 16}
        //   fill="white"
        //   fillOpacity={0.3}
        //   //stroke="white"
        //   //strokeWidth={1}
        //   pointerEvents="none" // So it doesn’t block interactions
        //   rx={4}
        // />

        <circle
          ref={highlightRef}
          cx={bbox.x + bbox.width * 0.5}
          cy={bbox.y + bbox.height * 0.5}
          r={bbox.width * 0.75}
          fill="white"
          fillOpacity={0.2}
          stroke="white"
          strokeWidth={1}
          pointerEvents="none" // So it doesn’t block interactions
          rx={4}
        />
      )}
      <g
        ref={ref}
        onClick={() => {
          setItems(
            combinationNames[id] || '',
            Array.from(vennElemMap[id] || [])
          )
        }}
        style={{ cursor: 'pointer' }}
      >
        {bbox && (
          <rect
            x={bbox.x}
            y={bbox.y}
            width={bbox.width}
            height={bbox.height}
            fill="transparent"
            //fillOpacity={0.2} // Invisible but captures mouse events
            onMouseOver={() => {
              setHighlight(true)
            }}
            onMouseOut={() => {
              setHighlight(false)
            }}
          />
        )}

        <text
          x={center[0]}
          y={center[1]}
          fontSize={settings.fonts.counts.size}
          fontWeight={settings.fonts.counts.weight}
          fontFamily={settings.fonts.counts.family}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={overlapLabels[id]?.color || 'white'}
          pointerEvents="none"
        >
          {n.toLocaleString()}
        </text>

        {settings.fonts.percentages.show && (
          <text
            x={center[0]}
            y={center[1] + 16}
            fontSize={settings.fonts.percentages.size}
            fontWeight={settings.fonts.percentages.weight}
            fontFamily={settings.fonts.percentages.family}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={overlapLabels[id]?.color || 'white'}
            pointerEvents="none"
          >
            {p}%
          </text>
        )}
      </g>
    </>
  )
}

interface ITitleTextProps {
  id: number
  textAnchor?: string
  center: ILim
}

export function TitleText({
  id,
  center,
  textAnchor = 'middle',
}: ITitleTextProps) {
  const { vennLists } = useVenn()
  const { settings, circles } = useVennSettings()
  const vennList = vennLists[id - 1]
  return (
    <text
      x={center[0]}
      y={center[1]}
      fontSize={settings.fonts.title.size}
      fontWeight={settings.fonts.title.weight}
      fontFamily={settings.fonts.title.family}
      fill={
        settings.fonts.title.colored
          ? circles[id]?.fill.color
          : settings.fonts.title.color
      }
      textAnchor={textAnchor}
      dominantBaseline="middle"
    >
      {vennList?.name || `List ${id}`}

      {settings.fonts.counts.show && (
        <tspan>
          {` (${(vennList?.uniqueItems.length || 0).toLocaleString()})`}
        </tspan>
      )}
    </text>
  )
}

export function makeTitle(name: string, items: string[]) {
  const n = items.length

  return `There ${n === 0 || n > 1 ? 'are' : 'is'} ${n} ${name.includes('AND') ? 'common' : 'unique'} item${n !== 1 ? 's' : ''} in ${name}:`
}

export interface IVennProps {
  overlapLabels?: { [key: string]: { color: string; label: string } }
}

export function SVGThreeWayVenn({ overlapLabels = {} }: IVennProps) {
  const { setSelectedItems } = useVenn()
  const { settings, circles } = useVennSettings()

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 0.75
  const labelRadius = settings.radius * 1.15
  const radius3 = settings.radius * 1.05

  const offset2: ILim = [
    Math.cos(30 * DEG_TO_RAD) * radius2,
    Math.sin(30 * DEG_TO_RAD) * radius2,
  ]

  const offset3: ILim = [
    Math.cos(30 * DEG_TO_RAD) * radius3,
    Math.sin(30 * DEG_TO_RAD) * radius3,
  ]

  const cA: ILim = [center[0] - offset2[0], center[1] - offset2[1]]
  const cB: ILim = [center[0] + offset2[0], center[1] - offset2[1]]
  const cC: ILim = [center[0], center[1] + radius2]

  const lA: ILim = [center[0] - offset3[0], center[1] - offset3[1]]
  const lB: ILim = [center[0] + offset3[0], center[1] - offset3[1]]
  const lC: ILim = [center[0], center[1] + radius3]

  const circle1Ref = useRef(null)
  const circle2Ref = useRef(null)
  const circle3Ref = useRef(null)

  useEffect(() => {
    // Pulse animation (scale up and down)
    gsap.timeline().fromTo(
      [circle1Ref.current, circle2Ref.current, circle3Ref.current],
      {
        scale: 0.5,
        opacity: 0.5,
      },
      {
        scale: 1,
        opacity: 1,
        //transformOrigin: 'center center',
        //repeat: -1,
        //yoyo: true,
        duration: 0.5,
        stagger: 0.05,
        ease: 'back.out',
      }
    )
  }, [])

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  return (
    <>
      {/* Circle A */}
      <circle
        ref={circle1Ref}
        cx={cA[0]}
        cy={cA[1]}
        r={settings.radius}
        fill={circles[1].fill.color}
        fillOpacity={circles[1].fill.opacity}
        stroke={circles[1].stroke.color}
        strokeOpacity={circles[1].stroke.opacity}
      />

      {settings.fonts.title.show && (
        <TitleText
          id={1}
          center={[cA[0] - labelRadius * 0.1, cA[1] - labelRadius]}
        />
      )}

      <CountText
        id={'1'}
        center={lA}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* Circle B */}
      <circle
        ref={circle2Ref}
        cx={cB[0]}
        cy={cB[1]}
        r={settings.radius}
        fill={circles[2].fill.color}
        fillOpacity={circles[2].fill.opacity}
        stroke={circles[2].stroke.color}
        strokeOpacity={circles[2].stroke.opacity}
      />

      {settings.fonts.title.show && (
        <TitleText
          id={2}
          center={[cB[0] + labelRadius * 0.1, cB[1] - labelRadius]}
        />
      )}

      <CountText
        id={'2'}
        center={lB}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* Circle C */}
      <circle
        ref={circle3Ref}
        cx={cC[0]}
        cy={cC[1]}
        r={settings.radius}
        fill={circles[3].fill.color}
        fillOpacity={circles[3].fill.opacity}
        stroke={circles[3].stroke.color}
        strokeOpacity={circles[3].stroke.opacity}
      />

      {settings.fonts.title.show && (
        <TitleText id={3} center={[cC[0], cC[1] + labelRadius]} />
      )}

      <CountText
        id={'3'}
        center={lC}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2'}
        center={[(cA[0] + cB[0]) / 2, lA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:3'}
        center={[(lA[0] + lC[0]) / 2, (lA[1] + lC[1]) / 2]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'2:3'}
        center={[(lB[0] + lC[0]) / 2, (lB[1] + lC[1]) / 2]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:2:3'}
        center={[cC[0], center[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />
    </>
  )
}
