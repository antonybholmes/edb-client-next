import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'

const LINE_CLS =
  'absolute left-0 top-0 pointer-events-none select-none shrink-0 bg-app-theme z-10 rounded-full'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorSelectedV({ w = 2 }: { w?: number }) {
  const { selectedPosition } = useTabIndicators() //groupId)

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.
  const previousSelectedPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const selectedLineRef1 = useRef<HTMLSpanElement>(null)
  const selectedLineRef2 = useRef<HTMLSpanElement>(null)

  const selectedTimelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (
      !selectedLineRef1.current ||
      !selectedLineRef2.current ||
      !selectedPosition
    ) {
      return
    }

    if (selectedTimelineRef.current) {
      selectedTimelineRef.current.kill()
    }

    if (previousSelectedPos.current) {
      const fromTop = previousSelectedPos.current.y < selectedPosition.y

      let y = fromTop
        ? (selectedPosition.y as number) - 1.5 * (selectedPosition.h as number)
        : (selectedPosition.y as number) + 1.5 * (selectedPosition.h as number)

      if (
        Math.abs(
          (previousSelectedPos.current.y as number) -
            (selectedPosition.y as number)
        ) < Math.abs((y - (selectedPosition.y as number)) as number)
      ) {
        y = previousSelectedPos.current.y as number
      }

      selectedTimelineRef.current = gsap
        .timeline()
        .set([selectedLineRef1.current, selectedLineRef2.current], {
          y,
          height: selectedPosition.h,
        })

      selectedTimelineRef.current = gsap
        .timeline()
        .to([selectedLineRef1.current, selectedLineRef2.current], {
          y: selectedPosition.y,
          height: selectedPosition.h,
          duration: 0.5,
          scaleY: selectedPosition.scale || 1,
          stagger: 0.1,
          ease: 'power2.out',
        })
    } else {
      selectedTimelineRef.current = gsap
        .timeline()
        .set([selectedLineRef1.current, selectedLineRef2.current], {
          y: selectedPosition.y,
          height: selectedPosition.h,
          scaleY: selectedPosition.scale ?? 1,
        })
    }

    previousSelectedPos.current = selectedPosition
  }, [selectedPosition?.y, selectedPosition?.h, selectedPosition?.scale])

  return (
    <>
      <span ref={selectedLineRef1} className={LINE_CLS} style={{ width: w }} />
      <span ref={selectedLineRef2} className={LINE_CLS} style={{ width: w }} />
    </>
  )
}
