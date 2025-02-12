import { VCenterRow } from '@/components/layout/v-center-row'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import type { IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

export const PLACEHOLDER_CLS = cn(
  'trans-300 min-w-0 flex flex-row gap-x-2 items-center px-2',
  'disabled:cursor-not-allowed data-[readonly=true]:bg-muted/40 overflow-hidden',
  FOCUS_INSET_RING_CLS
)

export const inputVariants = cva(PLACEHOLDER_CLS, {
  variants: {
    variant: {
      default: cn(
        'bg-background hover:border-ring',
        'data-[enabled=true]:data-[focus=true]:border-ring',
        'data-[enabled=true]:data-[focus=true]:ring-1',
        'border border-border rounded-theme'
      ),
      plain: '',
      trans: 'bg-white/20 hover:bg-white/30 text-white fill-white',
      header:
        'border border-border/50 bg-background/50 hover:bg-background stroke-foreground rounded-full',
      alt: 'bg-muted/50 hover:bg-muted px-2 stroke-foreground rounded-theme',
    },
    h: {
      sm: 'h-7',
      default: 'h-8',
      lg: 'h-9',
      xl: 'h-10',
      '2xl': 'h-11',
      header: 'h-9',
    },
  },
  defaultVariants: {
    variant: 'default',
    h: 'default',
  },
})

export const INPUT_CLS = cn(
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50 placeholder:opacity-50',
  'outline-none border-none ring-none min-w-0 grow'
)

export interface IPlaceholderProps extends IElementProps {
  id: string | undefined
  placeholder: string | undefined
  focus?: boolean
  hover?: boolean
  value: string | number | readonly string[] | undefined
  disabled?: boolean
}

export interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  inputCls?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  onChanged?: (v: string) => void
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      leftChildren,
      rightChildren,
      type,
      inputCls,
      variant = 'default',
      h = 'default',
      disabled,
      readOnly,
      onChanged,
      style,
      className,
      ...props
    },
    ref
  ) => {
    const [focus, setFocus] = useState(false)

    return (
      <VCenterRow
        className={inputVariants({
          variant,
          h,
          className: cn(PLACEHOLDER_CLS, className),
        })}
        data-enabled={!disabled}
        data-readonly={readOnly}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        data-focus={focus}
        style={style}
      >
        {leftChildren && leftChildren}
        <input
          type={type}
          className={cn(INPUT_CLS, inputCls)}
          ref={ref}
          disabled={disabled}
          readOnly={readOnly}
          onKeyDown={(e) => {
            //console.log(e)
            if (e.key === 'Enter') {
              onChanged?.(e.currentTarget.value)
            }
          }}
          {...props}
        />

        {rightChildren && rightChildren}
      </VCenterRow>
    )
  }
)
Input.displayName = 'Input'
