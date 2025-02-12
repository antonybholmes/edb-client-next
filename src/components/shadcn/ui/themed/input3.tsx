import { VCenterRow } from '@/components/layout/v-center-row'
import {
  CENTERED_ROW_CLS,
  ROUNDED_MD_CLS,
  TRANS_COLOR_CLS,
  TRANS_TIME_CLS,
} from '@/theme'
import { cn } from '@lib/class-names'
import { nanoid } from 'nanoid'
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type InputHTMLAttributes,
} from 'react'
import type { IPlaceholderProps } from './input'

export const CONTAINER_CLS = cn(
  TRANS_COLOR_CLS,
  ROUNDED_MD_CLS,
  'pt-2.5 pb-1.5 px-2 relative bg-background border border-border',
  'data-[enabled=true]:data-[focus=true]:border-ring',
  'data-[enabled=true]:data-[focus=true]:ring-1',

  'data-[error=true]:ring-red-600 min-w-0',
  'data-[enabled=false]:bg-muted'
)

export const PLACEHOLDER_CLS = cn(
  TRANS_TIME_CLS,
  CENTERED_ROW_CLS,
  'pointer-events-none absolute left-1.5 z-10 bg-background h-3 px-1.5',
  'data-[focus=false]:text-foreground/50 data-[focus=true]:text-theme data-[enabled=false]:text-foreground/50',
  'data-[hover=true]:text-theme'
)

export const INPUT_CLS = cn(
  'px-1 min-w-0 grow disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50 outline-none border-none ring-none'
)

export function Placeholder({
  id,
  placeholder,
  focus,
  hover,
  value,
  disabled = false,

  className,
}: IPlaceholderProps) {
  return (
    <label
      data-focus={focus}
      data-hover={hover}
      data-value={value !== ''}
      className={cn(PLACEHOLDER_CLS, className)}
      data-enabled={!disabled}
      style={{
        transform: `translateY(${focus || value ? '-1.3rem' : '-0.1rem'})`,
        fontSize: `${focus || value ? '75%' : '100%'}`,
        fontWeight: `${focus || value ? '500' : 'normal'}`,
      }}
      htmlFor={id}
    >
      {focus ? placeholder?.replace('...', '') : placeholder}
    </label>
  )
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean | undefined
  globalClassName?: string
  inputClassName?: string
}

export const Input3 = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      placeholder = '',
      value = '',
      type,
      disabled = false,
      error = false,

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
    const innerRef = useRef<HTMLInputElement>(null)
    useImperativeHandle(ref, () => innerRef.current!, [])

    useEffect(() => {
      if (focus && innerRef.current) {
        innerRef.current.select()
      }
    }, [focus])

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
          <Placeholder
            id={id ?? `input-v3-${nanoid()}`}
            placeholder={placeholder}
            focus={focus}
            hover={hover}
            value={value}
            disabled={disabled}
            data-enabled={!disabled}
            className={globalClassName}
          />
        )}

        <input
          ref={innerRef}
          type={type}
          value={value}
          //defaultValue={defaultValue}
          disabled={disabled}
          data-enabled={!disabled}
          className={cn(INPUT_CLS, globalClassName, inputClassName)}
          {...props}
        />

        {children}
      </VCenterRow>
    )
  }
)
Input3.displayName = 'Input3'
