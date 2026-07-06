import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useTabIndicators } from './tab-indicator-provider'

const LINE_CLS =
  'absolute left-0 top-0 pointer-events-none select-none shrink-0 bg-muted rounded-full z-0'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorFollowV({
  w = 2,
}: {
  groupId?: string
  w?: string | number
}) {
  const { position } = useTabIndicators() //groupId)

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.
  //const previousPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const highlightLineRef = useRef<HTMLSpanElement>(null)

  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!highlightLineRef.current || !position) {
      return
    }

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    timelineRef.current = gsap.timeline().to(
      highlightLineRef.current,
      {
        y: position.y,
        height: position.h,
        scaleY: position.scale || 1,
        duration: 0.8,
        ease: 'power3.out',
      },
      0
    )

    //previousPos.current = position
  }, [position])

  if (!position) {
    return null
  }

  return (
    <span
      ref={highlightLineRef}
      className={LINE_CLS}
      // animate={{
      //   x: tabIndicatorPos.x,
      //   width: tabIndicatorPos.size,
      // }}
      style={{ width: w }}
      //initial={false}
      //transition={{ ease: 'easeOut', duration: 0.25 }}
    />
  )
}
