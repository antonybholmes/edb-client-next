import { ANIMATION_DURATION_S } from '@/consts'
import { FOCUS_RING_CLS } from '@/theme'
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
  'relative h-[22px] shrink-0 w-[38px] rounded-full',
  'data-[enabled=true]:data-[state=checked]:bg-theme/75',
  'data-[enabled=true]:data-[state=checked]:hover:bg-theme',
  'data-[enabled=true]:data-[state=unchecked]:bg-muted',
  'data-[enabled=true]:data-[state=unchecked]:hover:bg-muted',
  'data-[enabled=false]:bg-muted trans-color'
)

// const TOGGLE_ENABLED_CLS = cn(
//   "data-[state=checked]:bg-theme data-[state=checked]:hover:bg-theme-hover",
//   "data-[state=unchecked]:bg-muted data-[state=unchecked]:hover:bg-muted",
// )

// const TOGGLE_DISABLED_CLS = cn(
//   "data-[state=checked]:bg-muted/25",
//   "data-[state=unchecked]:bg-muted/25",
// )

const THUMB_CLS = cn(
  'absolute shadow-sm pointer-events-none aspect-square shrink-0',
  'w-[24px] h-[18px] rounded-full bg-white z-30 left-[2px] shadow-md',
  'top-1/2 -translate-y-1/2'
)

// const HIGHLIGHT_THUMB_CLS = cn(
//   'absolute pointer-events-none aspect-square w-[20px] h-[20px]',
//   'rounded-full shrink-0 z-10 left-[1px] top-1/2 -translate-y-1/2',
//   'data-[checked=true]:bg-theme/10 data-[checked=false]:bg-foreground/5'
// )

// const PRESSED_THUMB_CLS = cn(
//   'absolute pointer-events-none aspect-square w-4.5 rounded-full shrink-0 z-20',
//   'data-[checked=true]:bg-theme/20 data-[checked=false]:bg-foreground/10',
//   'top-0.5 data-[checked=false]:left-0.5 data-[checked=true]:right-0.5'
// )

export interface ISwitchProps
  extends ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  side?: LeftRightPos
}

export const Switch = forwardRef<
  ComponentRef<typeof SwitchPrimitives.Root>,
  ISwitchProps
>(function Switch(
  {
    checked = false,
    disabled = false,
    side = 'left',
    className,
    title,
    children,
    ...props
  },
  ref
) {
  const thumbRef = useRef<HTMLSpanElement>(null)
  //const highlightThumbRef = useRef<HTMLSpanElement>(null)
  //const pressedThumbRef = useRef<HTMLSpanElement>(null)

  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  if (!props['aria-label']) {
    props['aria-label'] = title
  }

  if (!props['aria-label']) {
    props['aria-label'] = 'Switch'
  }

  // Looks nicer if animations are disabled on first render
  const initial = useRef(true)

  useEffect(() => {
    const duration = initial.current ? 0 : ANIMATION_DURATION_S

    const tl = gsap.timeline({ paused: true }).to(
      thumbRef.current,
      {
        transform: checked ? 'translate(10px, -50%)' : 'translate(0, -50%)',
        duration,
        ease: 'power2.inOut',
      },
      0
    )

    // if not disabled, animate the highlight ring too
    // if (highlightThumbRef.current) {
    //   tl.to(
    //     highlightThumbRef.current,
    //     {
    //       transform: checked
    //         ? `translate(10px, -50%) scale(${hover ? 1.8 : 1})`
    //         : `translate(0, -50%) scale(${hover ? 1.8 : 1})`,
    //       duration,
    //       ease: 'power2.inOut',
    //     },
    //     0
    //   )
    // }

    tl.play()
    // .to(
    //   pressedThumbRef.current,
    //   {
    //     transform: checked
    //       ? `translate(0.625rem, -50%) scale(${pressed ? "1.8" : "1"})`
    //       : `translate(0, -50%) scale(${pressed ? "1.8" : "1"})`,
    //     duration,
    //     ease: "power2.inOut",
    //   },
    //   0,
    // )

    initial.current = false
  }, [checked, hover, pressed])

  const button = (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      disabled={disabled}
      data-enabled={!disabled}
      //onCheckedChange={_onClick}
      className={TOGGLE_CLS}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      title={title}
      {...props}
    >
      <span
        //layout
        //initial={false}
        data-hover={hover}
        className={THUMB_CLS}
        ref={thumbRef}
        data-enabled={!disabled}
        data-checked={checked}
      />
      {/* {!disabled && (
        <>
          <span
            data-checked={checked}
            data-hover={true}
            //layout
            //animate={{ scale: hover || pressed ? 1.8 : 1 }}
            // initial={false}
            className={HIGHLIGHT_THUMB_CLS}
            ref={highlightThumbRef}
          />
           <motion.span
            data-checked={checked}
            data-hover={true}
            layout
            animate={{ scale: hover && pressed ? 2 : 1 }}
            initial={false}
            className={PRESSED_THUMB_CLS}
            ref={pressedThumbRef}
          />  
        </>
      )} */}
    </SwitchPrimitives.Root>
  )

  if (children) {
    return (
      <VCenterRow className={cn('gap-x-1', className)}>
        {side === 'left' && button}
        <VCenterRow className="gap-x-1">{children}</VCenterRow>
        {side === 'right' && button}
      </VCenterRow>
    )
  } else {
    return button
  }
})
