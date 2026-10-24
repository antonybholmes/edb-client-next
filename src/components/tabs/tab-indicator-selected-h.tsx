import { useReducedMotion } from '@/hooks/reduced-motion'
import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { ITabIndicatorPos, useTabIndicators } from './tab-indicator-provider'

export const EASE = 'power2.out'
export const DURATION = 0.5

const LINE_CLS =
  'absolute left-0 bottom-0 z-10 bg-app-theme pointer-events-none select-none shrink-0'

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

    const w = selectedPosition.w as number

    if (
      !reducedMotion &&
      previousSelectedPos.current?.x !== selectedPosition.x
    ) {
      const edges = {
        head: previousSelectedPos.current?.x as number,
        tail: previousSelectedPos.current?.x as number,
      }

      const render = () => {
        const left = Math.min(edges.head, edges.tail)
        const right = Math.max(edges.head, edges.tail) + w
        gsap.set(line1, {
          x: left,
          width: right - left,
          scaleX: selectedPosition.scale ?? 1,
        })
      }

      gsap
        .timeline({ onUpdate: render })
        .to(edges, {
          head: selectedPosition.x as number,
          duration: DURATION,
          ease: EASE,
        })
        .to(
          edges,
          {
            tail: selectedPosition.x as number,
            duration: DURATION,
            ease: EASE,
          },
          0.1
        )
    } else {
      gsap
        .timeline()
        .set(line1, {
          x: selectedPosition.x,
          width: w,
        })
        .to(line1, {
          scaleX: selectedPosition.scale ?? 1,
          duration: DURATION,
          ease: EASE,
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
    </>
  )
}
