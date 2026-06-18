import { EMPTY_RECT, rectEqual, type IRect } from '@/interfaces/rect'
import { useState, type RefObject } from 'react'
import { useDebounce, type IDebounceOptions } from './debounce'
import { useResizeObserver } from './resize-observer'

/**
 * Hook to track the size of a component using ResizeObserver.
 * Returns an object with width (w) and height (h) of the component.
 */
export function useDebouncedComponentSize(
  ref: RefObject<HTMLElement | null>,
  opts: IDebounceOptions<IRect> = {}
): IRect {
  const { delayMs = 50 } = opts

  const size = useComponentSize(ref)

  // only fire when size changes, not on every resize event, to avoid excessive re-renders.
  // Use rectEqual to compare previous and current size.
  const debouncedSetSize = useDebounce(size, {
    ...opts,
    delayMs,
    equalityFn: rectEqual,
  })

  return debouncedSetSize
}

export function useComponentSize(ref: RefObject<HTMLElement | null>): IRect {
  const [size, setSize] = useState<IRect>({ ...EMPTY_RECT })

  useResizeObserver(ref, entry => {
    setSize({
      x: entry.contentRect.x,
      y: entry.contentRect.y,
      w: entry.contentRect.width,
      h: entry.contentRect.height,
    })
  })

  return size
}
