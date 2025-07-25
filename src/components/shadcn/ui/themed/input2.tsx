import { cn } from '@lib/shadcn-utils'
import {
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { WarningIcon } from '@icons/warning-icon'
import type { IDivProps } from '@interfaces/div-props'
import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { cva, type VariantProps } from 'class-variance-authority'
import { Label } from './label'

export const PLACEHOLDER_CLS = cn(
  'min-w-0 flex flex-row gap-x-2 items-center grow relative',
  'disabled:cursor-not-allowed data-[readonly=true]:bg-muted/40',
  'after:absolute after:bottom-0 after:h-px after:w-full',
  'after:bg-border data-[focus=true]:after:bg-ring'
)

export const inputVariants = cva(PLACEHOLDER_CLS, {
  variants: {
    variant: {
      default: '',
    },
    h: {
      default: 'h-10',
    },
  },
  defaultVariants: {
    variant: 'default',
    h: 'default',
  },
})

export const INPUT_CLS = cn(
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50',
  'placeholder:opacity-60 outline-hidden border-none ring-none min-w-0 grow'
)

export interface IPlaceholderProps extends IDivProps {
  id: string | undefined
  placeholder: string | undefined
  focus?: boolean
  hover?: boolean
  value: string | number | readonly string[] | undefined
  disabled?: boolean
}

export interface IInputProps
  extends ComponentProps<'input'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
  inputCls?: string
  inputStyle?: CSSProperties
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  otherChildren?: ReactNode
  header?: string
  onTextChange?: (v: string) => void
  onTextChanged?: (v: string) => void
}

export function Input2({
  ref,
  leftChildren,
  rightChildren,
  otherChildren,
  type,
  inputCls,
  inputStyle,
  error = false,
  header = '',
  variant = 'default',
  h = 'default',
  disabled,
  readOnly,
  onChange,
  onTextChange,
  onTextChanged,
  style,
  className,
  ...props
}: IInputProps) {
  const [focus, setFocus] = useState(false)

  return (
    <BaseCol className={cn('gap-y-1', className)}>
      {header && (
        <Label className="text-xs font-bold text-foreground/75">{header}</Label>
      )}
      <VCenterRow className="gap-x-4">
        <VCenterRow
          className={inputVariants({
            variant,
            h,
            className: PLACEHOLDER_CLS,
          })}
          data-enabled={!disabled}
          data-readonly={readOnly}
          data-error={error}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          data-focus={focus}
          style={style}
          ref={ref}
        >
          {leftChildren && leftChildren}
          <input
            type={type}
            className={cn(INPUT_CLS, inputCls)}
            style={inputStyle}
            disabled={disabled}
            readOnly={readOnly}
            onChange={e => {
              onTextChange?.(e.currentTarget.value)
              onChange?.(e)
            }}
            onKeyDown={e => {
              //console.log(e)
              if (e.key === 'Enter') {
                onTextChanged?.(e.currentTarget.value)
              }
            }}
            {...props}
          />

          {rightChildren && rightChildren}
          {error && <WarningIcon stroke="stroke-destructive" w="w-4 h-4" />}
        </VCenterRow>
        {otherChildren && otherChildren}
      </VCenterRow>
    </BaseCol>
  )
}
