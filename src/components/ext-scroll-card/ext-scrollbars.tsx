import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import {
  useExtScrollRefsContext,
  useExtScrollStateContext,
} from './ext-scroll-provider'

export const SIZER_CLS = 'invisible bg-black h-px w-px absolute top-0 left-0'

export interface IScrollPosition {
  p: number
  normalized: number
}

export function ExtVScroll({ style, className }: IDivProps) {
  const { vScrollRef } = useExtScrollRefsContext()
  const { size, setScrollTop } = useExtScrollStateContext()

  return (
    <div
      id="v-scroll"
      className={cn(
        'relative overflow-y-scroll overflow-x-hidden w-4 custom-scrollbar',
        className
      )}
      style={style}
      ref={vScrollRef}
      onScroll={(e) => {
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
  const { hScrollRef } = useExtScrollRefsContext()
  const { size, setScrollLeft } = useExtScrollStateContext()

  return (
    <div
      ref={hScrollRef}
      id="h-scroll"
      className={cn(
        'relative overflow-x-scroll overflow-y-hidden h-4 custom-scrollbar',
        className
      )}
      style={style}
      onScroll={(e) => {
        const { scrollLeft, scrollWidth, clientWidth } = e.currentTarget
        const maxScrollLeft = scrollWidth - clientWidth
        const normalizedScroll =
          maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0

        // if we set scrollLeft elsewhere via the ref, this will still be triggered so
        // we can update the table reactively
        setScrollLeft({ p: scrollLeft, normalized: normalizedScroll })
      }}
      onWheel={(e) => {
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
