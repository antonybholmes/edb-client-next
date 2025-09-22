import { DEG_TO_RAD, ILim } from '@/lib/math/math'
import { gsap } from 'gsap'
import { useEffect, useRef } from 'react'
import {
  Circle,
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
  }, [])

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
      <Circle ref={circle1Ref} loc={cA} circle={circles['1']} />

      <TitleText id="1" center={[cA[0], cA[1] - labelRadius]} />

      <CountText
        id="1"
        center={[vennListsInUse > 1 ? lA[0] : cA[0], cA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      {/* Circle B */}

      <Circle ref={circle2Ref} loc={cB} circle={circles['2']} />

      <TitleText id="2" center={[cB[0], cB[1] - labelRadius]} />

      <CountText
        id="2"
        center={[lB[0], cB[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />

      <CountText
        id="1:2"
        center={[(cA[0] + cB[0]) / 2, cA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />
    </>
  )
}
