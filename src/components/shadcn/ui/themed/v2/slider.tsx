import { VCenterRow } from '@/components/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS } from '@/theme'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { useState, type ComponentProps } from 'react'

const THUMB_CLS = cn(
  FOCUS_RING_CLS,
  'h-3.5 w-3.5 aspect-square shrink-0 rounded-full border border-app-theme/70 bg-background select-none',
  'group-hover:border-app-theme disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
)

export function Slider({
  className = '',
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const [focus, setFocus] = useState(false)

  return (
    <SliderPrimitive.Root {...props}>
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none flex-row items-center group min-h-5 shrink-0 min-w-16',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={focus}
          className="relative h-0.75 grow rounded-full bg-muted data-[focus=true]:bg-border group-hover:bg-border"
        >
          <SliderPrimitive.Indicator
            data-focus={focus}
            className="h-0.75 bg-app-theme/70 data-[focus=true]:bg-app-theme group-hover:bg-app-theme"
          />

          <SliderPrimitive.Thumb
            className={THUMB_CLS}
            aria-label="Slider control"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
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
