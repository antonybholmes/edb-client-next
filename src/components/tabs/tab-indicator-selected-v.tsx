import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import {
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'
import { DURATION, EASE } from './tab-indicator-selected-h'

const LINE_CLS = `absolute left-0 top-0 
  pointer-events-none select-none shrink-0 
  bg-app-theme z-10`

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
  const edgesRef = useRef<{ head: number; tail: number } | null>(null)

  const selectedLineRef1 = useRef<HTMLSpanElement>(null)
  const timelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!selectedPosition || !selectedLineRef1.current) {
      return
    }

    const line1 = selectedLineRef1.current
    const h = selectedPosition.h as number
    const y = selectedPosition.y as number

    timelineRef.current?.kill()
    timelineRef.current = null

    if (reducedMotion || !previousSelectedPos.current) {
      edgesRef.current = { head: y, tail: y }
      gsap.set(line1, {
        y,
        height: h,
        scaleY: selectedPosition.scale ?? 1,
      })
    } else {
      let edges = edgesRef.current

      if (edges === null) {
        edges = { head: y, tail: y }
        edgesRef.current = edges
      }

      const render = () => {
        const top = Math.min(edges.head, edges.tail)
        const bottom = Math.max(edges.head, edges.tail) + h
        gsap.set(line1, {
          y: top,
          height: bottom - top,
        })
      }

      timelineRef.current = gsap
        .timeline({ onUpdate: render })
        .to(line1, {
          scaleY: selectedPosition.scale ?? 1,
          duration: DURATION,
          ease: EASE,
        })
        .to(
          edges,
          {
            head: y,
            duration: DURATION,
            ease: EASE,
          },
          0
        )
        .to(
          edges,
          {
            tail: y,
            duration: DURATION,
            ease: EASE,
          },
          0.1
        )
    }

    previousSelectedPos.current = selectedPosition

    return () => {
      timelineRef.current?.kill()
      timelineRef.current = null
    }
  }, [
    selectedPosition?.y,
    selectedPosition?.h,
    selectedPosition?.scale,
    reducedMotion,
  ])

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
