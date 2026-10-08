import type { LeftRightPos } from '@/components/side'
import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import { Field } from '@base-ui/react/field'
import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import gsap from 'gsap'
import {
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
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
  'flex flex-row items-center',
  'relative shrink-0 rounded-sm cursor-pointer group outline-none',
  'data-enabled:data-checked:bg-app-theme/70',
  'data-enabled:data-checked:hover:bg-app-theme',
  'data-enabled:data-checked:focus-visible:bg-app-theme',
  'data-enabled:data-unchecked:bg-muted',
  'data-enabled:data-unchecked:hover:bg-muted',
  'disabled:bg-muted trans-color'
)

const THUMB_CLS = cn(
  'absolute pointer-events-none shrink-0',
  'cursor-pointer rounded-full bg-white z-10',
  'border border-border shadow-md'
  //'left-[2px]'
)

export interface ISwitchProps extends ComponentProps<
  typeof SwitchPrimitive.Root
> {
  side?: LeftRightPos
}

export function SquareSwitch({
  ref,
  checked = false,
  disabled = false,
  side = 'left',
  className,
  title,
  'aria-label': ariaLabel,
  children,
  ...props
}: ISwitchProps) {
  const thumbRef = useRef<HTMLSpanElement>(null)
  //const highlightThumbRef = useRef<HTMLSpanElement>(null)
  // Looks nicer if animations are disabled on first render
  const initial = useRef(true)
  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  useEffect(() => {
    if (!thumbRef.current) {
      return
    }

    const duration = initial.current ? 0 : 0.5

    gsap.to(thumbRef.current, {
      //scale: hover ? 1.1 : 1,
      transformOrigin: 'center',
      x: checked ? 8 : 0,
      duration,
      ease: 'power1.out',
    })

    initial.current = false
  }, [checked, hover, pressed])

  let ret: ReactNode = (
    <SwitchPrimitive.Root
      ref={ref}
      checked={checked}
      disabled={disabled}
      data-enabled={present(!disabled)}
      className={TOGGLE_CLS}
      style={{ height: 6, width: 26 }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      title={title}
      aria-label={ariaLabel ?? title ?? 'Switch'}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-hover={hover}
        className={THUMB_CLS}
        ref={thumbRef}
        data-enabled={!disabled}
        data-checked={checked}
        style={{ height: 18, width: 18 }}
      />
    </SwitchPrimitive.Root>
  )

  if (children) {
    ret = (
      <Field.Root>
        <Field.Label
          className={cn('flex flex-row items-center gap-x-1.5', className)}
        >
          {side === 'left' && ret}

          {children}

          {side === 'right' && ret}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}
