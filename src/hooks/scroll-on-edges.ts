import { useRef, useState, type RefObject } from 'react'

interface IProps {
  edgeSize?: number
  scrollSpeed?: { x: number; y: number }
  onMouseUp?: () => void
}

export const EDGE_SCROLL_ZONE = 20

// converted from https://github.com/07harish/React-scroll-on-edges/blob/master/src/hooks/useScrollOnEdges.js

export function useScrollOnEdges(
  ref: RefObject<HTMLElement | null>,
  props: IProps = {}
) {
  const { edgeSize, scrollSpeed, onMouseUp } = {
    edgeSize: EDGE_SCROLL_ZONE,
    scrollSpeed: { x: 5, y: 5 },
    ...props,
  }

  const [isMouseDown, setIsMouseDown] = useState(false)
  const frameHandle = useRef<number>(0)

  function scrollOnEdgesMouseMove(event: MouseEvent) {
    if (!ref.current) {
      return
    }

    const el = ref.current

    const rect = el.getBoundingClientRect()

    // Get the viewport-relative coordinates of the mousemove event.
    const viewportX = event.clientX - rect.left
    const viewportY = event.clientY - rect.top

    // Get the rect height and width .
    const viewportWidth = rect.width
    const viewportHeight = rect.height

    // Get rect edges, where top and left will be same as `edgeSize`, /
    // bottom and right will be (rectDimensions - edgeSize)
    const edgeTop = edgeSize
    const edgeLeft = edgeSize
    const edgeBottom = viewportHeight - edgeSize
    const edgeRight = viewportWidth - edgeSize

    // Check if mouse is onunknown of the rect's edges
    const isInLeftEdge = viewportX < edgeLeft
    const isInRightEdge = viewportX > edgeRight
    const isInTopEdge = viewportY < edgeTop
    const isInBottomEdge = viewportY > edgeBottom

    // If the mouse is not in the rect edge, stop animation. Otherwise start animation
    if (isInLeftEdge || isInRightEdge || isInTopEdge || isInBottomEdge) {
      startAnimation()
    } else {
      stopAnimation()
    }

    // Sets Animation ID (frameID.curent) and Initiate scrolling
    function startAnimation() {
      frameHandle.current = window.requestAnimationFrame(animateScrolling)
    }

    // Animate scrolling when shouldScroll returns true
    function animateScrolling() {
      if (isMouseDown && autoScrollTo()) {
        // as long as mouse down and scrolling worked, keep animation going
        startAnimation()
      } else {
        stopAnimation()
      }
    }

    // cancels scrolling of Animation ID
    function stopAnimation() {
      if (frameHandle.current) {
        window.cancelAnimationFrame(frameHandle.current)
      }
    }

    // Measure maximum scrolling
    const maxScrollX = el.scrollWidth - el.clientWidth
    const maxScrollY = el.scrollHeight - el.clientHeight

    // Adjust the rect scroll based on the user's mouse position. Returns True
    // or False depending on whether or not the window scroll was changed.
    function autoScrollTo(): boolean {
      // Get the current scroll position of the rect.
      const currentScrollX = el.scrollLeft
      const currentScrollY = el.scrollTop

      const canScrollUp = currentScrollY > 0
      const canScrollDown = currentScrollY < maxScrollY
      const canScrollLeft = currentScrollX > 0
      const canScrollRight = currentScrollX < maxScrollX

      let nextScrollX = currentScrollX
      let nextScrollY = currentScrollY

      // Determine next X or Y scroll depending on the edges mouse is on.
      // By adding scroll speed to next scroll gives use new scrollTo of x, y

      // Should we scroll left?
      if (isInLeftEdge && canScrollLeft) {
        nextScrollX = nextScrollX - scrollSpeed.x

        // Should we scroll right?
      } else if (isInRightEdge && canScrollRight) {
        nextScrollX = nextScrollX + scrollSpeed.x
      }

      // Should we scroll up?
      if (isInTopEdge && canScrollUp) {
        nextScrollY = nextScrollY - scrollSpeed.y

        // Should we scroll down?
      } else if (isInBottomEdge && canScrollDown) {
        nextScrollY = nextScrollY + scrollSpeed.y
      }

      // Sanitize invalid maximums.
      nextScrollX = Math.max(0, Math.min(maxScrollX, nextScrollX))
      nextScrollY = Math.max(0, Math.min(maxScrollY, nextScrollY))

      if (nextScrollX !== currentScrollX || nextScrollY !== currentScrollY) {
        el.scrollTo(nextScrollX, nextScrollY)
        nextScrollY = 0
        return true
      } else {
        return false
      }
    }
  }

  function _onMouseUp() {
    setIsMouseDown(false)
    // we only use these listeners when actually dragging
    window.removeEventListener('mousemove', scrollOnEdgesMouseMove)
    window.removeEventListener('mouseup', _onMouseUp)
    onMouseUp?.()
  }

  /**
   * Call this function within a mousedown function and it will check if
   * mouse is near the edges and if the mouse is down and the use is dragging
   * it will trigger an auto scrolling animation to keep the viewport matched
   * to where the mouse is dragging.
   *
   */
  function scrollOnEdgesMouseDown() {
    setIsMouseDown(true)

    window.addEventListener('mousemove', scrollOnEdgesMouseMove)
    window.addEventListener('mouseup', _onMouseUp)
  }

  // useEffect(() => {
  //   window.addEventListener('mousemove', scrollOnEdgesMouseMove)

  //   return () => {
  //     window.removeEventListener('mousemove', scrollOnEdgesMouseMove)
  //   }
  // }, [])

  //   function scrollOnEdgesMouseUp() {

  // 	runMode.current = false
  //     //window.removeEventListener("mousemove", scrollOnEdgesMouseMove)
  //   }

  return scrollOnEdgesMouseDown //, scrollOnEdgesMouseMove]

  //   // Prop getter
  //   function getEdgeScrollingProps (elementProps) {
  //     const callAllFns = (...fns) => (...args) =>
  //       fns.forEach((fn) => fn && fn(...args))

  //     return {
  //       ...elementProps,
  //       style: { overflow: 'scroll', ...(elementProps && elementProps.style) },
  //       onMouseMove: callAllFns(
  //         elementProps && elementProps.onMouseMove,
  //         handleMousemove
  //       )
  //     }
  //}

  //return getEdgeScrollingProps
}
