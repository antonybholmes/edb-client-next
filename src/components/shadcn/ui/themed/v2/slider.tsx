import { VCenterRow } from '@/components/layout/v-center-row'
import { useNumDebounce } from '@/hooks/debounce'
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

interface IProps extends ComponentProps<typeof SliderPrimitive.Root> {
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
}

export function Slider({
  value,
  delayMs = 300,
  onValueChange,
  onNumChange,
  onNumChanged,
  className = '',
  ...props
}: IProps) {
  const [focus, setFocus] = useState(false)
  const [hover, setHover] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

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
    if (!ref.current) {
      return
    }

    gsap.to(ref.current, {
      scale: hover ? 1.1 : 1,
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
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
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
            ref={ref}
            data-focus={present(focus)}
            className={THUMB_CLS}
            aria-label="Slider control"
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}

export function SliderWithValue({
  value,
  className = '',
  side = 'left',
  dp = 0,
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  side?: 'left' | 'right'
  dp?: number
}) {
  const v = Array.isArray(value) ? value[0] : value || 0

  return (
    <VCenterRow className="gap-x-2">
      {side === 'left' && (
        <span className="bg-muted/50 py-1 rounded-sm text-center min-w-10">
          {v.toFixed(dp)}
        </span>
      )}
      <Slider {...props} value={value} className={className} />
      {side === 'right' && (
        <span className="ml-2 min-w-8">{v.toFixed(dp)}</span>
      )}
    </VCenterRow>
  )
}
