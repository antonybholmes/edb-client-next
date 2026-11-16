import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { DURATION_S } from './tab-indicator-follow-h'
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
  const { position, prevPosition } = useTabIndicators() //groupId)
  const { reducedMotion } = useReducedMotion()

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.
  //const previousPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const highlightLineRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const line = highlightLineRef.current

    if (!line || !position) {
      return
    }

    if (reducedMotion || !prevPosition) {
      gsap.set(line, {
        y: position.y,
        height: position.h,
        scaleY: position.scale ?? 1,
      })

      return
    }

    gsap.to(line, {
      y: position.y,
      height: position.h,
      scaleY: position.scale ?? 1,
      duration: DURATION_S,
      ease: 'power1.out',
      overwrite: 'auto',
    })
  }, [position?.y, position?.h, position?.scale, prevPosition])

  if (!position) {
    return null
  }

  return (
    <span ref={highlightLineRef} className={LINE_CLS} style={{ width: w }} />
  )
}
