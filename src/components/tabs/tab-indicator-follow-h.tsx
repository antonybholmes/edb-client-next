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
export function TabIndicatorFollowH({
  h = 2,
}: {
  h?: number
}) {
  const { position } = useTabIndicators() //groupId) //useContext(TabIndicatorContext)

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.
  const previousPos = useRef<ITabIndicatorPos | undefined>(undefined)
  //const previousSelectedPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const highlightedLineRef = useRef<HTMLSpanElement>(null)
  //const selectedLineRef = useRef<HTMLSpanElement>(null)

  const timelineRef = useRef<GSAPTimeline | null>(null)
  //const selectedTimelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!highlightedLineRef.current) {
      return
    }

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    if (position) {
      // we only animate if there was a previous position
      // so that we are transitioning from one position to another
      // and the user allows for animation. If there was no previous
      // position, it means we are transitioning from 0 width to
      // full width so we just want to set it instantly.
      if (previousPos.current && (position.animate ?? true)) {
        timelineRef.current = gsap.timeline().to(highlightedLineRef.current, {
          x: position.x,
          width: position.w,
          duration: 0.5,
          scaleX: position.scale ?? 1,
          ease: 'power3.out',
        })
      } else {
        timelineRef.current = gsap.timeline().set(highlightedLineRef.current, {
          x: position.x,
          width: position.w,
          height: `${h}px`,
          scaleX: position.scale ?? 1,
        })
      }
    } else {
      timelineRef.current = gsap.timeline().set(highlightedLineRef.current, {
        height: 0,
      })
    }

    previousPos.current = position
  }, [position?.x, position?.w, position?.scale])

  return (
    <span
      ref={highlightedLineRef}
      className="absolute bottom-0 left-0 z-0 bg-muted pointer-events-none select-none"
      style={{ height: `${h}px` }}
    />
  )
}
