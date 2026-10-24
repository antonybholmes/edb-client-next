import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'
import { DURATION, EASE } from './tab-indicator-selected-h'

const LINE_CLS =
  'absolute left-0 top-0 pointer-events-none select-none shrink-0 bg-app-theme z-10'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorSelectedV({
  w = 2,
}: {
  w?: number
  color?: string | undefined
}) {
  const { selectedPosition } = useTabIndicators() //groupId) //useContext(TabIndicatorContext)

  const { reducedMotion } = useReducedMotion() // assuming you have a hook named useReducedMotion

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.

  const previousSelectedPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const selectedLineRef1 = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const line1 = selectedLineRef1.current

    if (!line1 || !selectedPosition) {
      return
    }

    gsap.killTweensOf(line1)

    const h = selectedPosition.h as number

    if (
      !reducedMotion &&
      previousSelectedPos.current?.y !== selectedPosition.y
    ) {
      const edges = {
        head: previousSelectedPos.current?.y as number,
        tail: previousSelectedPos.current?.y as number,
      }

      const render = () => {
        const top = Math.min(edges.head, edges.tail)
        const bottom = Math.max(edges.head, edges.tail) + h
        gsap.set(line1, {
          y: top,
          height: bottom - top,
          scaleY: selectedPosition.scale ?? 1,
        })
      }

      gsap
        .timeline({ onUpdate: render })
        .to(edges, {
          head: selectedPosition.y as number,
          duration: DURATION,
          ease: EASE,
        })
        .to(
          edges,
          {
            tail: selectedPosition.y as number,
            duration: DURATION,
            ease: EASE,
          },
          0.1
        )
    } else {
      gsap
        .timeline()
        .set(line1, {
          y: selectedPosition.y,
          height: h,
        })
        .to(line1, {
          scaleY: selectedPosition.scale ?? 1,
          duration: DURATION,
          ease: EASE,
        })
    }

    previousSelectedPos.current = selectedPosition
  }, [selectedPosition?.y, selectedPosition?.h, selectedPosition?.scale])

  return (
    <span
      ref={selectedLineRef1}
      className={LINE_CLS}
      style={{
        width: w,
      }}
    />
  )
}
