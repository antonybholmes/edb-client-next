import { ANIMATION_DURATION_S } from '@/consts'
import { FOCUS_RING_CLS, TRANS_COLOR_CLS } from '@/theme'
import type { LeftRightPos } from '@components/side'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import * as SwitchPrimitives from '@radix-ui/react-switch'
import gsap from 'gsap'
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

// const THUMB_CLS =
//   "pointer-events-none block h-4 w-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"

// const Switch = forwardRef<
//   ElementRef<typeof SwitchPrimitives.Root>,
//   ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
// >(({ className, ...props }, ref) => (
//   <SwitchPrimitives.Root
//     className={cn(
//       "data-[state=unchecked]:input peer flex h-[20px] w-[36px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-theme",
//       className,
//     )}
//     {...props}
//     ref={ref}
//   >
//     <SwitchPrimitives.Thumb className={THUMB_CLS} />
//   </SwitchPrimitives.Root>
// ))
// Switch.displayName = SwitchPrimitives.Root.displayName

// export { Switch }

const TOGGLE_CLS = cn(
  FOCUS_RING_CLS,
  TRANS_COLOR_CLS,
  'relative h-3.5 shrink-0 w-6 rounded-full outline-hidden ease-in-out z-0 '
)

const TOGGLE_ENABLED_CLS = cn(
  'data-[state=checked]:bg-theme data-[state=checked]:hover:bg-theme-hover',
  'data-[state=unchecked]:bg-muted data-[state=unchecked]:hover:bg-muted'
)

const TOGGLE_DISABLED_CLS = cn(
  'data-[state=checked]:bg-muted/25',
  'data-[state=unchecked]:bg-muted/25 '
)

const THUMB_CLS = cn(
  'absolute shadow-md pointer-events-none block aspect-square shrink-0',
  'w-4 rounded-full bg-white z-30 -translate-y-1/2',
  'border data-[state=unchecked]:border-border data-[enabled=false]:border-border',
  'data-[enabled=true]:data-[state=checked]:border-ring'
)

interface IProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  side?: LeftRightPos
}

export const SmallSwitch = forwardRef<
  ComponentRef<typeof SwitchPrimitives.Root>,
  IProps
>(function SmallSwitch(
  {
    checked = false,
    disabled = false,
    side = 'left',
    className,
    children,
    ...props
  },
  ref
) {
  const thumbRef = useRef<HTMLSpanElement>(null)

  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (disabled) {
      return
    }
    gsap.timeline().to(
      thumbRef.current,
      {
        transform: checked ? 'translate(0.5rem, -50%)' : 'translate(0, -50%)',
        duration: ANIMATION_DURATION_S,
        ease: 'power2.inOut',
      },
      0
    )
  }, [checked, hover, pressed])

  const button = (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      disabled={disabled}
      //onCheckedChange={_onClick}
      className={cn(
        TOGGLE_CLS,
        disabled && [TOGGLE_DISABLED_CLS, TOGGLE_ENABLED_CLS]
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      {...props}
    >
      <SwitchPrimitives.Thumb
        className={THUMB_CLS}
        ref={thumbRef}
        data-enabled={!disabled}
      />
    </SwitchPrimitives.Root>
  )

  if (children) {
    return (
      <VCenterRow className={cn('gap-x-1', className)}>
        {side === 'left' && button}
        <VCenterRow className="gap-x-2">{children}</VCenterRow>
        {side === 'right' && button}
      </VCenterRow>
    )
  } else {
    return button
  }
})
