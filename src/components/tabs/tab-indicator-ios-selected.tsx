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
export function TabIndicatorIosSelected() {
  const { selectedPosition } = useTabIndicators() //groupId) //useContext(TabIndicatorContext)

  // we use this to track transitions between 0 width and non-zero width
  // to determine animation duration. If item was previously 0 width, we want
  // to set duration to 0 so it appears instantly rather than animating
  // from 0 width to full width which looks odd. Also, if the width is going
  // from non-zero to zero, we want to set duration to 0 so it disappears instantly.

  //const previousSelectedPos = useRef<ITabIndicatorPos | undefined>(undefined)

  const selectedLineRef = useRef<HTMLSpanElement>(null)

  const selectedTimelineRef = useRef<GSAPTimeline | null>(null)

  useEffect(() => {
    if (!selectedLineRef.current || !selectedPosition) {
      return
    }

    if (selectedTimelineRef.current) {
      selectedTimelineRef.current.kill()
    }

    selectedTimelineRef.current = gsap.timeline().to(
      selectedLineRef.current,
      {
        x: selectedPosition.x,
        //y: selectedPosition.y,
        width: selectedPosition.w,
        //height: selectedPosition.h,
        scale: selectedPosition.scale || 1,
        duration: 0.6,
        ease: 'back.out',
      },
      0
    )
  }, [selectedPosition])

  return (
    <span
      ref={selectedLineRef}
      className="absolute left-0 top-0 z-20 h-full bg-muted/90 rounded-full pointer-events-none select-none"
      // style={{
      //   width: defaultWidth,
      // }}
      // style={{
      //   //height: selectedPosition?.h,
      //   //top: selectedPosition?.y,
      //   backgroundColor: color,
      // }}
    ></span>
  )
}
