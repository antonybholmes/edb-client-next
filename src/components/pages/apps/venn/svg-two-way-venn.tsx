import { DEG_TO_RAD, ILim } from '@/lib/math/math'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import {
  CountText,
  IVennProps,
  makeTitle,
  TitleText,
} from './svg-three-way-venn'
import { useVennSettings } from './venn-settings-store'
import { useVenn } from './venn-store'

export function SVGTwoWayVenn({ overlapLabels = {} }: IVennProps) {
  const { setSelectedItems, vennListsInUse } = useVenn()
  const { settings, circles } = useVennSettings()

  const circle1Ref = useRef<SVGCircleElement | null>(null)
  const circle2Ref = useRef<SVGCircleElement | null>(null)

  useEffect(() => {
    if (vennListsInUse < 2) return
    // Pulse animation (scale up and down)
    gsap.timeline().fromTo(
      [circle1Ref.current, circle2Ref.current],
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
  }, [vennListsInUse])

  function _setItems(name: string, items: string[]) {
    setSelectedItems(makeTitle(name, items), items)
  }

  const center = [settings.w * 0.5, settings.w * 0.5]
  const radius2 = settings.radius * 0.75
  const labelRadius = settings.radius * 1.15
  const radius3 = settings.radius * 1.05

  const offset2 = [
    Math.cos(30 * DEG_TO_RAD) * radius2,
    Math.sin(30 * DEG_TO_RAD) * radius2,
  ]

  const offset3 = [
    Math.cos(30 * DEG_TO_RAD) * radius3,
    Math.sin(30 * DEG_TO_RAD) * radius3,
  ]

  const cA: ILim = [center[0] - offset2[0], center[1] - offset2[1]]
  const cB: ILim = [center[0] + offset2[0], center[1] - offset2[1]]

  const lA: ILim = [center[0] - offset3[0], center[1] - offset3[1]]
  const lB: ILim = [center[0] + offset3[0], center[1] - offset3[1]]
  return (
    <>
      {/* Circle A */}
      <circle
        ref={circle1Ref}
        cx={cA[0]}
        cy={cA[1]}
        r={settings.radius}
        fill={circles[1].fill}
        fillOpacity={circles[1].fillOpacity}
        stroke={circles[1].stroke}
      />

      <TitleText id={1} center={[cA[0], cA[1] - labelRadius]} />

      <CountText
        id={'1'}
        center={[vennListsInUse > 1 ? lA[0] : cA[0], cA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {vennListsInUse > 1 && (
        <>
          {/* Circle B */}
          <circle
            ref={circle2Ref}
            cx={cB[0]}
            cy={cB[1]}
            r={settings.radius}
            fill={circles[2].fill}
            fillOpacity={circles[2].fillOpacity}
            stroke={circles[2].stroke}
          />

          <TitleText id={2} center={[cB[0], cB[1] - labelRadius]} />

          <CountText
            id={'2'}
            center={[lB[0], cB[1]]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />

          <CountText
            id={'1:2'}
            center={[(cA[0] + cB[0]) / 2, cA[1]]}
            overlapLabels={overlapLabels}
            setItems={_setItems}
          />
        </>
      )}
    </>
  )
}
