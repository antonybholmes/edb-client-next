import type { LeftRightPos } from '@/components/side'
import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import { Field } from '@base-ui/react/field'
import { Switch as SwitchPrimitives } from '@base-ui/react/switch'
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
  'relative shrink-0 rounded-full cursor-pointer group outline-none',
  'data-enabled:data-checked:bg-app-theme/70',
  'data-enabled:data-checked:hover:bg-app-theme',
  'data-enabled:data-checked:focus-visible:bg-app-theme',
  'data-enabled:data-unchecked:bg-muted',
  'data-enabled:data-unchecked:hover:bg-muted',
  'disabled:bg-muted trans-color'
)

const THUMB_CLS = cn(
  'absolute pointer-events-none shrink-0',
  'cursor-pointer rounded-full bg-white z-30',
  'top-1/2 -translate-y-1/2 flex flex-row justify-center items-center'
)

export interface ISwitchProps extends ComponentProps<
  typeof SwitchPrimitives.Root
> {
  side?: LeftRightPos
}

export function Switch({
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
  //const pressedThumbRef = useRef<HTMLSpanElement>(null)

  const [hover, setHover] = useState(false)
  const [pressed, setPressed] = useState(false)

  ariaLabel = ariaLabel ?? title ?? 'Switch'

  // Looks nicer if animations are disabled on first render
  const initial = useRef(true)

  useEffect(() => {
    const duration = initial.current ? 0 : 0.4 //ANIMATION_DURATION_S

    const tl = gsap.timeline()

    tl.to(
      thumbRef.current,
      {
        //width: checked || hover ? '1.25rem' : '1rem',

        //left: hover ? 2 : 8,
        //scaleX: hover ? 1.5 : 1,
        transform: checked ? 'translate(10px, -50%)' : 'translate(2px, -50%)',
        duration,
        ease: 'back.out',
      },
      0
    )

    initial.current = false
  }, [checked, hover, pressed])

  let ret: ReactNode = (
    <SwitchPrimitives.Root
      ref={ref}
      checked={checked}
      disabled={disabled}
      data-enabled={present(!disabled)}
      className={TOGGLE_CLS}
      style={{ height: 20, width: 32 }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      title={title}
      aria-label={ariaLabel}
      {...props}
    >
      <span
        data-hover={hover}
        className={THUMB_CLS}
        ref={thumbRef}
        data-enabled={!disabled}
        data-checked={checked}
        style={{ height: 16, width: 20 }}
      ></span>
    </SwitchPrimitives.Root>
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
