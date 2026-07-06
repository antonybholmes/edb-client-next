import { cn } from '@/lib/shadcn-utils'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

import { useRef, useState, type ComponentProps } from 'react'
// const THUMB_CLS = cn(
//   FOCUS_RING_CLS,
//   'h-3.5 w-3.5 aspect-square shrink-0 rounded-full border border-app-theme/70 bg-background select-none',
//   'group-hover:border-app-theme disabled:pointer-events-none disabled:opacity-50 cursor-pointer'
// )

const LABEL_CLS =
  'absolute text-center pointer-events-none left-1/2 -translate-x-1/2 h-full flex flex-row items-center justify-center text-xs overflow-hidden whitespace-nowrap'

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
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const v = Array.isArray(value) ? value[0] : value || 0

  const pc = (v / (max - min)) * 100

  // useEffect(() => {
  //   if (ref.current) {
  //     gsap.to(ref.current, {
  //       scaleY: hover || focus ? 1.2 : 1,
  //       duration: 0.5,
  //       ease: 'power2.out',
  //     })
  //   }
  // }, [hover, focus])

  return (
    <SliderPrimitive.Root
      value={value}
      min={min}
      max={max}
      {...props}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      thumbAlignment="edge"
      className={cn('relative', className)}
    >
      {/* <SliderPrimitive.Control className="relative  touch-none select-none   group  shrink-0 min-w-16 ">
        <Slider.Track className="h-1 w-full bg-neutral-200 select-none dark:bg-neutral-800">
          <SliderPrimitive.Indicator
            data-focus={focus}
            className="h-5   bg-app-theme/50 group-hover:bg-app-theme/60 data-[focus=true]:bg-app-theme/60 trans-color"
          />

          <Slider.Thumb
            aria-label="Volume"
            className="size-4 border border-neutral-950 bg-white select-none has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-neutral-950 dark:has-[:focus-visible]:outline-white dark:border-white dark:bg-neutral-950"
          />
        </Slider.Track>
      </SliderPrimitive.Control> */}

      <SliderPrimitive.Control className="flex min-w-16 touch-none items-center py-0.5 select-none">
        <SliderPrimitive.Track className="h-5 w-full bg-muted select-none rounded-xs">
          <SliderPrimitive.Indicator className="bg-app-theme/50 select-none rounded-xs" />
          <SliderPrimitive.Thumb
            aria-label="Volume"
            className="w-2 h-6 bg-app-theme select-none rounded-xs"
          />
        </SliderPrimitive.Track>

        <span
          className={cn(LABEL_CLS, 'z-10')}
          style={{
            // clip-path: inset(top right bottom left);
            clipPath: `inset(0 0 0 ${pc * 1.2}%)`,
          }}
        >
          {format(v)}
        </span>

        <span
          className={cn(LABEL_CLS, 'text-background z-20')}
          style={{
            clipPath: `inset(0 ${100 - pc * 1.2}% 0 0)`,
          }}
        >
          {format(v)}
        </span>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  )
}
