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

export function SVGOneWayVenn({ overlapLabels = {} }: IVennProps) {
  const { setSelectedItems, vennListsInUse } = useVenn()
  const { settings, circles } = useVennSettings()

  const circle1Ref = useRef<SVGCircleElement | null>(null)

  useEffect(() => {
    // Pulse animation (scale up and down)
    gsap.timeline().fromTo(
      [circle1Ref.current],
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

  const lA: ILim = [center[0] - offset3[0], center[1] - offset3[1]]

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

      <TitleText id={1} center={[cA[0], cA[1] - labelRadius]} />

      <CountText
        id={'1'}
        center={[vennListsInUse > 1 ? lA[0] : cA[0], cA[1]]}
        overlapLabels={overlapLabels}
        setItems={_setItems}
      />
    </>
  )
}
