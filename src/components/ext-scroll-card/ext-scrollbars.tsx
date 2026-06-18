import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { useExtScrollContext } from './ext-scroll-provider'

export const SIZER_CLS = 'invisible bg-black h-px w-px absolute top-0 left-0'
//const DRAG_MULTIPLIER = 4

export interface IScrollPosition {
  p: number
  normalized: number
}

export function ExtVScroll({ style, className }: IDivProps) {
  const { size, vScrollRef, setScrollTop } = useExtScrollContext()

  // const dragStatus = useRef({
  //   isDown: false,
  //   startY: 0,
  //   scrollTop: 0,
  // })

  // useEffect(() => {
  //   // 2. This runs ONLY during an active drag operation
  //   function onMouseMove(e: MouseEvent) {
  //     e.preventDefault()

  //     const y = e.pageY - vScrollRef.current!.offsetTop
  //     const walkY = (y - dragStatus.current.startY) * DRAG_MULTIPLIER //(x - dragStatus.current.startX) * 1.5

  //     vScrollRef.current!.scrollTop = walkY - dragStatus.current.scrollTop
  //   }

  //   // 3. This tears down listeners the moment the user lets go anywhere
  //   function onMouseUp() {
  //     vScrollRef.current?.classList.remove('grabbing')

  //     // Remove listeners from window immediately
  //     window.removeEventListener('mousemove', onMouseMove)
  //     window.removeEventListener('mouseup', onMouseUp)
  //   }

  //   // 1. Initial entry point attached to the container
  //   function onMouseDown(e: MouseEvent) {
  //     vScrollRef.current?.classList.add('grabbing')

  //     dragStatus.current.startY = e.pageY - vScrollRef.current!.offsetTop
  //     dragStatus.current.scrollTop = vScrollRef.current!.scrollTop

  //     // Attach temporary tracking events to global window
  //     window.addEventListener('mousemove', onMouseMove, { passive: false })
  //     window.addEventListener('mouseup', onMouseUp)
  //   }

  //   vScrollRef.current?.addEventListener('mousedown', onMouseDown)

  //   // Initial cleanup if component unmounts mid-render loop
  //   return () => {
  //     vScrollRef.current?.removeEventListener('mousedown', onMouseDown)
  //   }
  // }, [])

  return (
    <div
      id="v-scroll"
      className={cn(
        'relative overflow-y-scroll overflow-x-hidden w-4 custom-scrollbar',
        className
      )}
      style={style}
      ref={vScrollRef}
      onScroll={e => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
        const maxScrollTop = scrollHeight - clientHeight
        const normalizedScroll = maxScrollTop > 0 ? scrollTop / maxScrollTop : 0

        setScrollTop({ p: scrollTop, normalized: normalizedScroll })
      }}
    >
      <span
        className={SIZER_CLS}
        style={{
          height: size.h,
        }}
      />
    </div>
  )
}

export function ExtHScroll({ style, className }: IDivProps) {
  const { size, hScrollRef, setScrollLeft } = useExtScrollContext()

  // const dragStatus = useRef({
  //   isDown: false,
  //   startX: 0,
  //   scrollLeft: 0,
  // })

  // useEffect(() => {
  //   // 2. This runs ONLY during an active drag operation
  //   function onMouseMove(e: MouseEvent) {
  //     // Bypasses passive event warnings cleanly
  //     e.preventDefault()

  //     const x = e.pageX - hScrollRef.current!.offsetLeft

  //     const walkX = (x - dragStatus.current.startX) * DRAG_MULTIPLIER //(x - dragStatus.current.startX) * 1.5

  //     hScrollRef.current!.scrollLeft = walkX - dragStatus.current.scrollLeft
  //   }

  //   // 3. This tears down listeners the moment the user lets go anywhere
  //   function onMouseUp() {
  //     hScrollRef.current?.classList.remove('grabbing')

  //     // Remove listeners from window immediately
  //     window.removeEventListener('mousemove', onMouseMove)
  //     window.removeEventListener('mouseup', onMouseUp)
  //   }

  //   // 1. Initial entry point attached to the container
  //   function onMouseDown(e: MouseEvent) {
  //     hScrollRef.current?.classList.add('grabbing')

  //     dragStatus.current.startX = e.pageX - hScrollRef.current!.offsetLeft
  //     dragStatus.current.scrollLeft = hScrollRef.current!.scrollLeft

  //     // Attach temporary tracking events to global window
  //     window.addEventListener('mousemove', onMouseMove, { passive: false })
  //     window.addEventListener('mouseup', onMouseUp)
  //   }

  //   hScrollRef.current?.addEventListener('mousedown', onMouseDown)

  //   // Initial cleanup if component unmounts mid-render loop
  //   return () => {
  //     hScrollRef.current?.removeEventListener('mousedown', onMouseDown)
  //   }
  // }, [])

  return (
    <div
      id="h-scroll"
      className={cn(
        'relative overflow-x-scroll overflow-y-hidden h-4 custom-scrollbar',
        className
      )}
      style={style}
      ref={hScrollRef}
      onScroll={e => {
        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget
        const maxScrollLeft = scrollWidth - clientWidth
        const normalizedScroll =
          maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0

        // if we set scrollLeft elsewhere via the ref, this will still be triggered so
        // we can update the table reactively
        setScrollLeft({ p: scrollLeft, normalized: normalizedScroll })
      }}
      onWheel={e => {
        // allow horizontal scrolling with mouse wheel + shift
        e.currentTarget.scrollLeft += e.deltaY
      }}
    >
      <span
        className={SIZER_CLS}
        style={{
          width: size.w,
        }}
      />
    </div>
  )
}
