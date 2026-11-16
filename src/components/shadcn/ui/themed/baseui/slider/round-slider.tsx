import { ITickItem } from '@/components/plot/axes/svg-axis-props'
import { useNumDebounce } from '@/hooks/debounce'
import { useReducedMotion } from '@/hooks/reduced-motion'
import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import {
  Slider as SliderPrimitive,
  SliderRootChangeEventDetails,
} from '@base-ui/react/slider'
import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

const THUMB_CLS = cn(
  'h-4 w-5 shrink-0 rounded-full',
  'border border-border/80 bg-background select-none',
  'disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
)

export const DEFAULT_SLIDER_TICKS: ITickItem[] = [
  // {
  //   v: 0,
  //   label: '0',
  // },
  {
    v: 0.25,
    label: '25',
  },

  {
    v: 0.5,
    label: '50',
  },
  {
    v: 0.75,
    label: '75',
  },
  // {
  //   v: 1,
  //   label: '100',
  // },
]

export interface ISliderProps extends ComponentProps<
  typeof SliderPrimitive.Root
> {
  onNumChange?: (v: number) => void
  /**
   * Called after user stops changing the slider value for a certain
   * amount of time (default: 300ms) to prevent excessive calls
   * while dragging the slider thumb.
   *
   * @param v
   * @returns
   */
  onNumChanged?: (v: number) => void
  delayMs?: number
  ticks?: ITickItem[]
  tickSize?: number
}

export function RoundSlider({
  value,
  delayMs = 300,
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

  const prevValueRef = useRef<number>(_v)
  const debouncedV = useNumDebounce(_v, { delayMs })

  useEffect(() => {
    const v = Array.isArray(value) ? value[0] : value || 0
    setV(v)
  }, [value])

  useEffect(() => {
    if (!thumbRef.current) {
      return
    }

    if (reducedMotion) {
      gsap.set(thumbRef.current, {
        scale: hover ? 1.2 : 1,
        opacity: hover ? 0.6 : 1,
        ease: 'power2.out',
        duration: 0.3,
      })

      return
    }

    gsap.to(thumbRef.current, {
      scale: hover ? 1.2 : 1,
      opacity: hover ? 0.6 : 1,
      ease: 'power2.out',
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
          'relative flex touch-none select-none flex-row items-center group min-h-5 shrink-0 min-w-20',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={present(focus)}
          className="relative h-1 grow rounded-full bg-muted/70 data-focus:bg-muted group-hover:bg-muted trans-color"
        >
          <SliderPrimitive.Indicator
            data-focus={present(focus)}
            className="h-1 bg-app-theme/70 rounded-full data-focus:bg-app-theme group-hover:bg-app-theme trans-color"
          />

          <SliderPrimitive.Thumb
            ref={thumbRef}
            data-focus={present(focus)}
            className={THUMB_CLS}
            aria-label="Slider control"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
