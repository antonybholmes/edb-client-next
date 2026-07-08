import { VCenterRow } from '@/components/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { useState, type ComponentProps } from 'react'

const THUMB_CLS = cn(
  'h-4 w-5 aspect-square shrink-0 rounded-full shadow-lg border border-border/50 group-hover:border-border',
  'data-[focus=true]:border-border bg-background select-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer trans-color'
)

export function Slider({
  className = '',
  ...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
  const [focus, setFocus] = useState(false)

  return (
    <SliderPrimitive.Root thumbAlignment="edge" {...props}>
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none flex-row items-center group min-h-5 shrink-0 min-w-20',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={focus}
          className="relative h-1 grow rounded-full bg-muted data-[focus=true]:bg-border group-hover:bg-border trans-color"
        >
          <SliderPrimitive.Indicator
            data-focus={focus}
            className="h-1 bg-app-theme/70 rounded-full data-[focus=true]:bg-app-theme group-hover:bg-app-theme trans-color"
          />

          <SliderPrimitive.Thumb
            data-focus={focus}
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
