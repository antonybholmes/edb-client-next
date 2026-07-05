import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorIosSelected({
  color = undefined,
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

  const selectedLineRef = useRef<HTMLSpanElement>(null)

  const selectedTimelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!selectedLineRef.current) {
      return
    }

    if (selectedTimelineRef.current) {
      selectedTimelineRef.current.kill()
    }

    if (selectedPosition) {
      //if (previousSelectedPos.current) {
      selectedTimelineRef.current = gsap
        .timeline()
        .to(selectedLineRef.current, {
          x: selectedPosition.x,
          width: selectedPosition.w,
          duration: 1,
          scaleX: selectedPosition.scale ?? 1,
          ease: 'back.out',
        })
    } else {
      selectedTimelineRef.current = gsap
        .timeline()
        .set(selectedLineRef.current, {
          width: 0,
        })
    }

    previousSelectedPos.current = selectedPosition
  }, [selectedPosition?.x, selectedPosition?.w, selectedPosition?.scale])

  return (
    <span
      ref={selectedLineRef}
      className="absolute left-0 top-0 z-20 bg-background rounded-full pointer-events-none select-none"

      style={{
        height: selectedPosition?.h,
        top: selectedPosition?.y,
        backgroundColor: color,
      }}
    />
  )
}
