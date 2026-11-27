import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'

import { useCounterEffect } from '@/hooks/update-effect'
import { present } from '@/lib/dom-utils'
import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import gsap from 'gsap'
import { Check } from 'lucide-react'
import { useRef, useState, type ReactNode } from 'react'
import { ICheckboxProps } from './round-check-box'

export const CHECK_CLS = cn(
  FOCUS_RING_CLS,
  'flex flex-row items-center justify-center shrink-0 cursor-pointer',
  'whitespace-nowrap gap-x-1.5 p-0 m-0 group rounded-sm aspect-square',
  'w-4.5 h-4.5 shrink-0 border',
  'data-unchecked:border-border/70',
  'data-unchecked:data-hover:border-app-theme/30',
  'data-checked:border-transparent relative',

  'data-disabled:cursor-not-allowed data-disabled:opacity-60'
)

const RIPPLE_CLS = `absolute rounded-full aspect-square bg-app-theme/50 z-0 
  top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 pointer-events-none`

const EASE = 'power1.out'

export function MaterialCheckbox({
  id = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  title,
  children,
  className,
  ...props
}: ICheckboxProps) {
  const [hover, setHover] = useState(false)
  const rippleRef = useRef<HTMLSpanElement>(null)

  const checkRef = useRef<SVGSVGElement>(null)
  const ref = useRef<HTMLButtonElement>(null)

  useCounterEffect(
    (counter) => {
      const timeline = gsap.timeline().set(
        ref.current,
        {
          backgroundColor: checked ? 'var(--edb-app-theme)' : 'transparent',
          delay: checked ? 0 : 0.3,
        },
        0
      )

      if (counter > 0) {
        timeline
          .to(
            checkRef.current,
            {
              strokeDashoffset: checked ? 0 : -24,
              duration: 0.2,
              ease: EASE,
              delay: checked ? 0.1 : 0,
            },
            0
          )
          .to(
            rippleRef.current,
            {
              width: '3rem',
              height: '3rem',
              opacity: 0,
              duration: 1,
              ease: EASE,
            },
            0
          )
          .set(
            rippleRef.current,
            {
              width: '0',
              height: '0',
              opacity: 1,
            },
            1
          )
      } else {
        timeline.set(
          checkRef.current,
          {
            strokeDashoffset: checked ? 0 : -24,
          },
          0
        )
      }

      return () => timeline.kill()
    },
    [checked]
  )

  let ret: ReactNode = (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      data-hover={present(hover)}
      onCheckedChange={onCheckedChange}
      className={CHECK_CLS}
      disabled={disabled}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      id={id}
      {...props}
    >
      {/* <CheckboxPrimitive.Indicator> */}
      <Check
        ref={checkRef}
        className="stroke-white relative z-10"
        size={14}
        strokeWidth={3}
        strokeDasharray="24"
        strokeDashoffset="-24"
      />
      {/* </CheckboxPrimitive.Indicator> */}

      <span ref={rippleRef} className={RIPPLE_CLS} />
    </CheckboxPrimitive.Root>
  )

  if (children) {
    ret = (
      <Field.Root className={className} title={title}>
        <Field.Label className="flex flex-row items-center gap-x-1">
          {ret}
          {children}
        </Field.Label>
      </Field.Root>
    )
  }

  return ret
}
