import { FOCUS_RING_CLS, TRANS_COLOR_CLS } from '@/theme'
import { cn } from '@lib/shadcn-utils'
import * as SliderPrimitive from '@radix-ui/react-slider'

import {
  forwardRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

const THUMB_CLS = cn(
  TRANS_COLOR_CLS,
  FOCUS_RING_CLS,
  'block h-4 w-4 aspect-square rounded-full border border-border bg-background',
  'group-hover:border-theme/75 disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
)

const Slider = forwardRef<
  ComponentRef<typeof SliderPrimitive.Root>,
  ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [focus, setFocus] = useState(false)

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex touch-none select-none flex-row items-center group h-4',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-focus={focus}
        className="relative h-[3px] grow overflow-hidden rounded-full bg-muted data-[focus=true]:bg-border group-hover:bg-border trans-color"
      >
        <SliderPrimitive.Range
          data-focus={focus}
          className="absolute h-full bg-muted data-[focus=true]:bg-theme group-hover:bg-theme trans-color"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        className={THUMB_CLS}
        aria-label="Slider control"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      />
    </SliderPrimitive.Root>
  )
})
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
