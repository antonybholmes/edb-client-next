import { cn } from '@/lib/shadcn-utils'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { useState, type ComponentProps } from 'react'

// const THUMB_CLS = cn(
//   FOCUS_RING_CLS,
//   'h-3.5 w-3.5 aspect-square shrink-0 rounded-full border border-app-theme/70 bg-background select-none',
//   'group-hover:border-app-theme disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
// )

const LABEL_CLS =
  'absolute text-center pointer-events-none w-full h-full flex flex-row items-center justify-center text-xs overflow-hidden whitespace-nowrap'

export function BarSlider({
  value,
  min = 0,
  max = 100,
  format = (value) => `${Math.round(value * 100)}%`,
  className = '',
  ...props
}: ComponentProps<typeof SliderPrimitive.Root> & {
  format?: (value: number) => string
}) {
  const [focus, setFocus] = useState(false)
  const v = Array.isArray(value) ? value[0] : value || 0

  const pc = (v / (max - min)) * 100

  return (
    <SliderPrimitive.Root
      value={value}
      min={min}
      max={max}
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
    >
      <SliderPrimitive.Control
        className={cn(
          'relative flex touch-none select-none flex-row items-center group rounded-sm overflow-hidden shrink-0',
          className
        )}
      >
        <SliderPrimitive.Track
          data-focus={focus}
          className="relative h-6 grow bg-muted/50 group-hover:bg-muted/70 data-[focus=true]:bg-muted/70 trans-color"
        >
          <SliderPrimitive.Indicator
            data-focus={focus}
            className="h-full bg-app-theme/70 group-hover:bg-app-theme data-[focus=true]:bg-app-theme trans-color"
          />

          <SliderPrimitive.Thumb />
        </SliderPrimitive.Track>
        <span
          className={cn(LABEL_CLS, 'z-10')}
          style={{
            // clip-path: inset(top right bottom left);
            clipPath: `inset(0 0 0 ${pc}%)`,
          }}
        >
          {format(v)}
        </span>

        <span
          className={cn(LABEL_CLS, 'text-background z-20')}
          style={{
            clipPath: `inset(0 ${100 - pc}% 0 0)`,
          }}
        >
          {format(v)}
        </span>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
