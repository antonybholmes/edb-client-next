import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'

const LINE_CLS =
  'absolute left-0 bottom-0 z-10 bg-app-theme pointer-events-none select-none shrink-0 rounded-full'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorSelectedH({
  h = 2,
}: {
  h?: number
  color?: string | undefined
}) {
  const { selectedPosition } = useTabIndicators() //groupId) //useContext(TabIndicatorContext)

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
      const fromLeft = previousSelectedPos.current.x < selectedPosition.x

      let x = fromLeft
        ? (selectedPosition.x as number) - 1.5 * (selectedPosition.w as number)
        : (selectedPosition.x as number) + 1.5 * (selectedPosition.w as number)

      if (
        Math.abs(
          (previousSelectedPos.current.x as number) -
            (selectedPosition.x as number)
        ) < Math.abs((x - (selectedPosition.x as number)) as number)
      ) {
        x = previousSelectedPos.current.x as number
      }

      // immediate move to close by to the element so animation
      // does not have to jump large distances
      selectedTimelineRef.current = gsap
        .timeline()
        .set([selectedLineRef1.current, selectedLineRef2.current], {
          x,
          width: selectedPosition.w,
        })

      selectedTimelineRef.current = gsap
        .timeline()
        .to([selectedLineRef1.current, selectedLineRef2.current], {
          x: selectedPosition.x,
          width: selectedPosition.w,
          duration: 0.5,
          scaleX: selectedPosition.scale ?? 1,
          stagger: 0.1,
          ease: 'power2.out',
        })
    } else {
      selectedTimelineRef.current = gsap
        .timeline()
        .set([selectedLineRef1.current, selectedLineRef2.current], {
          x: selectedPosition.x,
          width: selectedPosition.w,

          scaleX: selectedPosition.scale ?? 1,
        })
    }

    previousSelectedPos.current = selectedPosition
  }, [selectedPosition?.x, selectedPosition?.w, selectedPosition?.scale])

  return (
    <>
      <span
        ref={selectedLineRef1}
        className={LINE_CLS}
        style={{
          height: h,
        }}
      />
      <span
        ref={selectedLineRef2}
        className={LINE_CLS}
        style={{
          height: h,
        }}
      />
    </>
  )
}
