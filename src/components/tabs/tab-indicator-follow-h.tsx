import gsap from 'gsap'
import { useEffect, useRef } from 'react'
import { useTabIndicators } from './tab-indicator-provider'

/**
 * A horizontal line that can be used to follow the mouse
 * over tabs with animation both moving and resizing to the
 * tab being hovered over.
 *
 * @param param0
 * @returns
 */
export function TabIndicatorFollowH({ h = 2 }: { h?: number }) {
  const { position, prevPosition } = useTabIndicators() //groupId) //useContext(TabIndicatorContext)

  const highlightedLineRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const line = highlightedLineRef.current

    if (!line || !position) {
      return
    }

    if (!prevPosition) {
      gsap.set(line, {
        x: position.x,
        width: position.w,
        scaleX: position.scale ?? 1,
      })

      return
    }

    gsap.to(line, {
      x: position.x,
      width: position.w,
      scaleX: position.scale ?? 1,
      duration: 0.5,
      ease: 'power.out',
      overwrite: 'auto',
    })
  }, [position?.x, position?.w, position?.scale, position?.animate, h])

  if (!position) {
    return null
  }

  return (
    <span
      ref={highlightedLineRef}
      className="absolute bottom-0 left-0 z-0 bg-muted pointer-events-none select-none"
      style={{ height: `${h}px` }}
    />
  )
}
