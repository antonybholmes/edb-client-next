import { cn } from '@lib/class-names'

import { SVG_CRISP_EDGES } from '@/consts'
import { FOCUS_RING_CLS, INPUT_BORDER_CLS } from '@/theme'
import { MinusIcon } from '@icons/minus-icon'
import { PlusIcon } from '@icons/plus-icon'
import { useEffect, useRef, useState } from 'react'
import { BaseRow } from '../layout/base-row'
import { ToolbarFooterButton } from './toolbar-footer-button'

interface IProps {
  value: number
  range: { min: number; max: number }
  onSliderChange?: (value: number) => void
  inc?: number
  className?: string
}

const BUTTON_CLS = 'justify-center w-7'

const ORB_CLS = cn(
  INPUT_BORDER_CLS,
  'trans-300 transition-all absolute top-1/2 z-30 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white group-hover:border-primary'
)

// https://codesandbox.io/s/serene-yalow-et830i?file=/src/Range/Range.module.sass

export function Slider({
  value,
  onSliderChange,
  range,
  inc = 0.1,
  className,
}: IProps) {
  //const [percent, setPercent] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [hover, setHover] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const lineRef = useRef<HTMLSpanElement>(null)
  const orbRef = useRef<HTMLSpanElement>(null)
  const gap = range.max - range.min

  function valueToFrac(value: number) {
    return Math.max(0, Math.min(1, (value - range.min) / gap))
  }

  function fracToValue(f: number) {
    return f * gap + range.min
  }

  function setValue(v: number) {
    onSliderChange && onSliderChange(v)
  }

  function onMouseMove(event: MouseEvent | React.MouseEvent) {
    if (ref.current) {
      const { left, width } = ref.current.getBoundingClientRect()
      const x = event.clientX - left
      const f = Math.max(0, Math.min(1, x / width))
      //setPercent(f * 100)

      setValue(fracToValue(f))
    }
  }

  function onMouseUp(_event: unknown) {
    setIsDragging(false)
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    //document.removeEventListener('touchmove', onMouseMove)
    document.removeEventListener('touchend', onMouseUp)
    document.removeEventListener('touchcancel', onMouseUp)
  }

  function onMouseDown(event: MouseEvent | React.MouseEvent) {
    setIsDragging(true)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    //document.addEventListener('touchmove', onMouseMove)
    document.addEventListener('touchend', onMouseUp)
    document.addEventListener('touchcancel', onMouseUp)
    onMouseMove(event)
  }

  function increment() {
    setValue(Math.max(range.min, Math.min(range.max, value + inc)))
  }

  function decrement() {
    setValue(Math.max(range.min, Math.min(range.max, value - inc)))
  }

  useEffect(() => {
    // gsap
    //   .timeline()
    //   .to(
    //     orbRef.current,
    //     {
    //       left: percent,
    //       borderColor: hover || isDragging ? "border-primary" : "",
    //       duration: 0.3,
    //       ease: "power2.out",
    //     },
    //     0,
    //   )
    // .to(
    //   lineRef.current,
    //   {
    //     width: percent,
    //     duration: 0.3,
    //     ease: "power2.out",
    //   },
    //   0,
    // )
  }, [value, hover, isDragging])

  const percent = `${valueToFrac(value) * 100}%`

  return (
    <BaseRow className={cn('hidden gap-x-1 md:flex md:gap-x-3')}>
      <ToolbarFooterButton className={BUTTON_CLS} onClick={decrement}>
        <MinusIcon
          w="w-3"
          stroke="stroke-muted-foreground stroke-2"
          shapeRendering={SVG_CRISP_EDGES}
        />
      </ToolbarFooterButton>
      <div
        ref={ref}
        className={cn(
          FOCUS_RING_CLS,
          'group relative grow cursor-pointer select-none',
          className
        )}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onMouseDown={onMouseDown}
        onKeyDown={(e) => {
          //console.log(e)
          switch (e.code) {
            case 'ArrowUp':
            case 'ArrowLeft':
              decrement()
              break
            case 'Space':
            case 'Enter':
            case 'ArrowDown':
            case 'ArrowRight':
              increment()
              break
            default:
              break
          }
        }}
        tabIndex={0}
      >
        <span
          className="transition-color trans-300 absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-muted group-hover:bg-accent"
          style={{ height: 2 }}
        />
        <span
          ref={lineRef}
          className="trans-300 transition-color absolute left-0 top-1/2 z-20 -translate-y-1/2 bg-primary"
          style={{ width: percent, height: 2 }}
        />
        <span
          ref={orbRef}
          className={cn(ORB_CLS, [isDragging || hover, 'border-primary'])}
          style={{ left: percent }}
        />
      </div>
      <ToolbarFooterButton className={BUTTON_CLS} onClick={increment}>
        <PlusIcon
          w="w-3"
          className="fill-foreground/50"
          shapeRendering={SVG_CRISP_EDGES}
        />
      </ToolbarFooterButton>
    </BaseRow>
  )
}
