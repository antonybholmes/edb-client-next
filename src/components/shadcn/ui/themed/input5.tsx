import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { ANIMATION_DURATION_S } from '@/consts'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import gsap from 'gsap'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'

const CONTAINER_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'h-11 max-h-11 rounded-theme trans-color relative items-end bg-background border border-border pr-3',
  'data-[enabled=true]:border-border data-[enabled=true]:hover:border-ring',
  'data-[error=true]:ring-red-600 min-w-0',
  'data-[enabled=false]:bg-muted',
  'data-[enabled=true]:data-[focus=true]:border-ring',
  'data-[enabled=true]:data-[focus=true]:ring-1'
)

const PLACEHOLDER_CLS = cn(
  'pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 z-10',
  'data-[focus=false]:text-muted-foreground data-[focus=true]:text-theme data-[enabled=false]:text-muted-foreground',
  'data-[enabled=true]:data-[hover=true]:text-theme',
  'data-[focus=true]:font-medium data-[value=true]:font-medium'
)

const INPUT_CLS = cn(
  'px-2.5 pb-1 min-w-0 disabled:cursor-not-allowed disabled:opacity-25 read-only:opacity-25 outline-none border-none ring-none'
)

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | undefined
  globalClassName?: string
  inputClassName?: string

  onChanged?: (v: string) => void
}

export const Input5 = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      placeholder,
      value,
      defaultValue,
      type,
      disabled,
      error = false,
      onChanged,
      onKeyDown,
      className,
      globalClassName,
      inputClassName,
      children,
      ...props
    },
    ref
  ) => {
    const [focus, setFocus] = useState(false)
    const [hover, setHover] = useState(false)
    const labelRef = useRef<HTMLLabelElement>(null)
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current!, [])

    useEffect(() => {
      if (focus && innerRef.current) {
        innerRef.current.select()
      }
    }, [focus])

    useEffect(() => {
      if (!labelRef || !labelRef.current) {
        return
      }

      gsap.timeline().to(labelRef.current, {
        y: focus || value ? '-0.6rem' : 0,
        fontSize: focus || value ? '80%' : '100%',
        duration: ANIMATION_DURATION_S,
        ease: 'power2.out',
      })
    }, [focus, value])

    return (
      <VCenterRow
        className={cn(CONTAINER_CLS, globalClassName, className)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        data-enabled={!disabled}
        data-error={error}
        data-focus={focus}
      >
        {placeholder && (
          <label
            ref={labelRef}
            data-focus={focus}
            data-hover={hover}
            data-value={value !== ''}
            className={cn(PLACEHOLDER_CLS, className)}
            data-enabled={!disabled}
            htmlFor={id}
          >
            {focus ? placeholder?.replace('...', '') : placeholder}
          </label>
        )}
        <BaseCol className="justify-end grow h-full">
          <input
            ref={innerRef}
            type={type}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            data-enabled={!disabled}
            className={cn(INPUT_CLS, globalClassName, inputClassName)}
            onKeyDown={(e) => {
              //console.log(e)
              if (e.key === 'Enter') {
                onChanged?.(e.currentTarget.value)
              }

              onKeyDown?.(e)
            }}
            {...props}
          />
        </BaseCol>
        {children}
      </VCenterRow>
    )
  }
)
Input5.displayName = 'Input5'
