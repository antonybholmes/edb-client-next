import { VCenterRow } from '@/components/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'
import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ComponentProps } from 'react'

const THUMB_CLS = cn(
  'h-4 w-5 shrink-0 rounded-full',
  'border border-border/80 bg-background select-none',
  'disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
)

export function Slider({
  className = '',
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const [focus, setFocus] = useState(false)
  const [hover, setHover] = useState(false)

  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!ref.current) {
      return
    }

    gsap.to(ref.current, {
      scale: hover ? 1.2 : 1,
      opacity: hover ? 0.6 : 1,
      ease: 'power2.out',
      duration: 0.3,
    })
  }, [hover])

  return (
    <SliderPrimitive.Root
      //thumbAlignment="edge"
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      // allow space on right side of slider for thumb to move fully to the end without being cut off
      className="px-3"
    >
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none flex-row items-center group min-h-5 shrink-0 min-w-20',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={focus}
          className="relative h-1 grow rounded-full bg-muted/70 data-[focus=true]:bg-muted group-hover:bg-muted trans-color"
        >
          <SliderPrimitive.Indicator
            data-focus={focus}
            className="h-1 bg-app-theme/70 rounded-full data-[focus=true]:bg-app-theme group-hover:bg-app-theme trans-color"
          />

          <SliderPrimitive.Thumb
            ref={ref}
            data-focus={focus}
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
