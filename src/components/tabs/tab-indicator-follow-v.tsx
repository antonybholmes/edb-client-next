import { cn } from '@/lib/shadcn-utils'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'

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
export function TabIndicatorFollowV({
  w = 2,
}: {
  groupId?: string
  w?: number
}) {
  const { position } = useTabIndicators() //groupId)

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.
  const previousPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const highlightLineRef = useRef<HTMLSpanElement>(null)

  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!highlightLineRef.current) {
      return
    }

    if (timelineRef.current) {
      timelineRef.current.kill()
    }

    if (position) {
      if (previousPos.current) {
        timelineRef.current = gsap.timeline().to(highlightLineRef.current, {
          y: position.y,
          height: position.h,
          scaleY: position.scale || 1,
          duration: 0.5,
          ease: 'power3.out',
        })
      } else {
        timelineRef.current = gsap.timeline().set(highlightLineRef.current, {
          y: position.y,
          height: position.h,
          scaleY: position.scale || 1,
          width: `${w}px`,
        })
      }
    } else {
      timelineRef.current = gsap.timeline().set(highlightLineRef.current, {
        width: 0,
      })
    }

    previousPos.current = position
  }, [position?.y, position?.h])

  return (
    <span
      ref={highlightLineRef}
      className={cn(LINE_CLS, 'bg-muted')}
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
