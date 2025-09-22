import { ILim } from '@/lib/math/math'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import {
  CountText,
  IVennProps,
  makeTitle,
  TitleText,
} from './svg-three-way-venn'
import { IVennCircleProps, useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

interface IEllipseProps {
  circle: IVennCircleProps
  ref: React.RefObject<SVGEllipseElement | null>
  loc: ILim
  radius: number
  transform?: string
  mode: 'outline' | 'fill'
}

export function Ellipse({
  circle,
  radius,
  ref,
  loc,
  transform,
  mode,
}: IEllipseProps) {
  const { settings } = useVennSettings()

  return (
    <ellipse
      ref={ref}
      cx={loc[0]}
      cy={loc[1]}
      rx={radius * 0.5}
      ry={radius}
      fill={
        mode === 'fill' && settings.isFilled && circle.fill.show
          ? circle.fill.color
          : 'none'
      }
      fillOpacity={circle.fill.opacity}
      stroke={
        mode === 'outline' && settings.isOutlined ? circle.stroke.color : 'none'
      }
      strokeOpacity={circle.stroke.opacity}
      transform={transform}
    />
  )
}

export function SVGFourWayVenn({ overlapLabels = {} }: IVennProps) {
  const { setSelectedItems } = useVenn()
  const { settings, circles } = useVennSettings()

  const circle1Ref = useRef<SVGEllipseElement | null>(null)
  const circle2Ref = useRef<SVGEllipseElement | null>(null)
  const circle3Ref = useRef<SVGEllipseElement | null>(null)
  const circle4Ref = useRef<SVGEllipseElement | null>(null)

  useEffect(() => {
    // Pulse animation (scale up and down)
    gsap.timeline().fromTo(
      [
        circle1Ref.current,
        circle2Ref.current,
        circle3Ref.current,
        circle4Ref.current,
      ],
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
        ease: 'back.out',
        stagger: 0.05,
      }
    )
  }, [])

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  const center: ILim = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 1.2

  return (
    <>
      {/* Circle A */}
      <Ellipse
        ref={circle1Ref}
        circle={circles[1]}
        loc={center}
        radius={radius2}
        transform={`translate(${-radius2 / 2}, ${radius2 / 4}) rotate(-45, ${center[0]}, ${center[1]}) `}
        mode="fill"
      />

      <TitleText
        id={'1'}
        center={[center[0] - radius2 * 0.9, center[1] + radius2 * 0.8]}
        textAnchor="end"
      />

      {/* Circle B */}
      <Ellipse
        ref={circle2Ref}
        circle={circles[2]}
        loc={center}
        radius={radius2}
        transform={`rotate(-45, ${center[0]}, ${center[1]})`}
        mode="fill"
      />

      <TitleText
        id={'2'}
        center={[center[0] - radius2 / 2, center[1] - radius2]}
      />

      {/* Circle C */}
      <Ellipse
        ref={circle3Ref}
        circle={circles[3]}
        loc={center}
        radius={radius2}
        transform={`rotate(45, ${center[0]}, ${center[1]})`}
        mode="fill"
      />

      <TitleText
        id={'3'}
        center={[center[0] + radius2 / 2, center[1] - radius2]}
      />

      {/* Circle 4 */}

      <Ellipse
        ref={circle4Ref}
        circle={circles[4]}
        loc={center}
        radius={radius2}
        transform={`translate(${radius2 * 0.5}, ${radius2 * 0.25}) rotate(45, ${center[0]}, ${center[1]}) `}
        mode="fill"
      />

      <TitleText
        id="4"
        center={[center[0] + radius2 * 0.9, center[1] + radius2 * 0.8]}
        textAnchor="start"
      />

      {/* Lists */}

      <CountText
        id="1"
        center={[center[0] - radius2 * 0.96, center[1] - radius2 * 0.06]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="2"
        center={[center[0] - radius2 * 0.42, center[1] - radius2 * 0.6]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="3"
        center={[center[0] + radius2 * 0.42, center[1] - radius2 * 0.6]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'4'}
        center={[center[0] + radius2 * 0.96, center[1] - radius2 * 0.06]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="1:2"
        center={[center[0] - radius2 * 0.62, center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="2:3"
        center={[center[0], center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="3:4"
        center={[center[0] + radius2 * 0.62, center[1] - radius2 * 0.32]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="1:3"
        center={[center[0] - radius2 * 0.52, center[1] + radius2 * 0.48]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="2:4"
        center={[center[0] + radius2 * 0.52, center[1] + radius2 * 0.48]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id={'1:4'}
        center={[center[0], center[1] + radius2 * 0.82]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="1:2:3"
        center={[center[0] - radius2 * 0.32, center[1] + radius2 * 0.05]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="2:3:4"
        center={[center[0] + radius2 * 0.32, center[1] + radius2 * 0.05]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="1:2:3:4"
        center={[center[0], center[1] + radius2 * 0.4]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <Ellipse
        ref={circle1Ref}
        circle={circles['1']}
        loc={center}
        radius={radius2}
        transform={`translate(${-radius2 / 2}, ${radius2 / 4}) rotate(-45, ${center[0]}, ${center[1]}) `}
        mode="outline"
      />

      <Ellipse
        ref={circle2Ref}
        circle={circles['2']}
        loc={center}
        radius={radius2}
        transform={`rotate(-45, ${center[0]}, ${center[1]})`}
        mode="outline"
      />

      <Ellipse
        ref={circle3Ref}
        circle={circles['3']}
        loc={center}
        radius={radius2}
        transform={`rotate(45, ${center[0]}, ${center[1]})`}
        mode="outline"
      />

      <Ellipse
        ref={circle4Ref}
        circle={circles['4']}
        loc={center}
        radius={radius2}
        transform={`translate(${radius2 * 0.5}, ${radius2 * 0.25}) rotate(45, ${center[0]}, ${center[1]}) `}
        mode="outline"
      />

      {/* <text
        x={center[0]}
        y={center[1] + radius2 * 0.4}
        fontSize="16"
        textAnchor="middle"
        dominantBaseline="middle"
        fill={overlapLabels['1:2:3']?.color || 'white'}
        onClick={() => {
          _setItems(
            combinationNames['1:2:3'] || '',
            Array.from(vennElemMap.get('1:2:3') || [])
          )
        }}
        style={{ cursor: 'pointer' }}
      >
        {vennElemMap.get('1:2:3:4')?.size || 0}
      </text> */}
    </>
  )
}
