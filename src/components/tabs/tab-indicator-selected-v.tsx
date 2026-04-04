import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { type ITabIndicatorPos } from './tab-indicator-provider'
import { useTabIndicators } from './tab-indicator-store'

const LINE_CLS =
  'absolute left-0 top-0 pointer-events-none select-none shrink-0'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorSelectedV({
  groupId,
  w = 2,
}: {
  groupId: string
  w?: number
}) {
  const { selectedPosition } = useTabIndicators(groupId)

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
      if (previousSelectedPos.current) {
        selectedTimelineRef.current = gsap
          .timeline()
          .to(selectedLineRef.current, {
            y: selectedPosition.y,
            height: selectedPosition.h,
            duration: 0.5,
            scaleY: selectedPosition.scale || 1,
            ease: 'power3.out',
          })
      } else {
        selectedTimelineRef.current = gsap
          .timeline()
          .set(selectedLineRef.current, {
            y: selectedPosition.y,
            height: selectedPosition.h,
            width: `${w}px`,
            scaleY: selectedPosition.scale || 1,
          })
      }
    } else {
      selectedTimelineRef.current = gsap
        .timeline()
        .set(selectedLineRef.current, {
          width: 0,
        })
    }

    previousSelectedPos.current = selectedPosition
  }, [selectedPosition?.y, selectedPosition?.h, selectedPosition?.scale])

  return (
    <span
      ref={selectedLineRef}
      className={cn(LINE_CLS, 'bg-theme z-10')}
      // animate={{
      //   x: tabIndicatorPos.x,
      //   width: tabIndicatorPos.size,
      // }}
      style={{ width: `${w}px` }}
      //initial={false}
      //transition={{ ease: 'easeOut', duration: 0.25 }}
    />
  )
}
