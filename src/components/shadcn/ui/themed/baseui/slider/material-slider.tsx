import { useNumDebounce } from '@/hooks/debounce'
import { useReducedMotion } from '@/hooks/reduced-motion'
import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import {
  Slider as SliderPrimitive,
  SliderRootChangeEventDetails,
} from '@base-ui/react/slider'
import { gsap } from 'gsap'
import { useEffect, useRef, useState } from 'react'
import { ISliderProps } from './round-slider'

const THUMB_CLS = cn(
  'h-5 w-[4px] shrink-0 rounded-full bg-app-theme cursor-pointer'
)

export function MaterialSlider({
  value,
  min = 0,
  max = 100,
  delayMs = 300,
  ticks,
  tickSize = 3,
  onValueChange,
  onNumChange,
  onNumChanged,
  className = '',
  ...props
}: ISliderProps) {
  const [focus, setFocus] = useState(false)
  const [hover, setHover] = useState(false)
  const { reducedMotion } = useReducedMotion()

  const thumbRef = useRef<HTMLDivElement | null>(null)

  const [_v, setV] = useState<number>(
    Array.isArray(value) ? value[0] : value || 0
  )

  const range = max - min
  const p = (_v - min) / range

  const prevValueRef = useRef<number>(_v)
  const debouncedV = useNumDebounce(_v, { delayMs })

  useEffect(() => {
    const v = Array.isArray(value) ? value[0] : value || 0
    setV(v)
  }, [value])

  useEffect(() => {
    if (!thumbRef.current || reducedMotion) {
      return
    }

    // if (reducedMotion) {
    //   gsap.set(thumbRef.current, {
    //     //scaleY: hover ? 1.1 : 1,
    //     //opacity: hover ? 0.6 : 1,
    //     ease: 'power2.out',
    //     duration: 0.3,
    //   })

    //   return
    // }

    gsap.to(thumbRef.current, {
      //scaleX: hover ? 2 : 1,
      zIndex: 50,
      width: hover ? '8px' : '4px',
      //opacity: hover ? 0.6 : 1,
      ease: 'power3.out',
      duration: 0.3,
    })
  }, [hover])

  useEffect(() => {
    if (prevValueRef.current !== debouncedV) {
      prevValueRef.current = debouncedV
      onNumChanged?.(debouncedV)
    }
  }, [debouncedV, onNumChanged])

  function _onValueChange(
    value: number | readonly number[],
    eventDetails: SliderRootChangeEventDetails
  ) {
    const v = Array.isArray(value) ? value[0] : value

    setV(v)
    onValueChange?.(value, eventDetails)
    onNumChange?.(v)
  }

  return (
    <SliderPrimitive.Root
      value={_v}
      min={min}
      max={max}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onValueChange={(value, eventDetails) => {
        _onValueChange?.(value, eventDetails)
      }}
      // allow space on right side of slider for thumb to move fully to the end without being cut off
      className="px-3"
      {...props}
    >
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none flex-row items-center group min-h-4 shrink-0 min-w-20 data-dragging:cursor-pointer',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={present(focus)}
          className="relative h-3 grow"
        >
          {/* <SliderPrimitive.Indicator
            data-focus={present(focus)}
            className="h-1 bg-app-theme/70 rounded-full data-focus:bg-app-theme group-hover:bg-app-theme trans-color"
          /> */}

          <span
            data-hover={present(hover)}
            className="h-full bg-app-theme/70 data-hover:bg-app-theme absolute rounded-l-sm rounded-r-xs trans-color"
            style={{ width: `calc(${p * 100}% - 6px)` }}
          />

          <SliderPrimitive.Thumb
            ref={thumbRef}
            data-focus={present(focus)}
            className={THUMB_CLS}
            aria-label="Slider control"
            style={{ zIndex: 50 }}
          />

          <span
            className="h-full bg-app-theme/20 absolute z-0 rounded-l-xs rounded-r-sm right-0"
            style={{ width: `calc(${(1 - p) * 100}% - 6px)` }}
          />

          {ticks &&
            ticks.map((tick) => (
              <span
                key={tick.v}
                className="absolute aspect-square rounded-full shrink-0 grow-0 z-10 top-1/2 -translate-y-1/2 bg-white"
                style={{
                  left: `calc(${tick.v * 100}% - ${tickSize / 2}px)`,
                  width: tickSize,
                  height: tickSize,
                }}
              />
            ))}
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
