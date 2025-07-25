import { cn } from '@lib/shadcn-utils'
import {
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'

import { WarningIcon } from '@icons/warning-icon'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'
import { randId } from '@lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { Label } from './label'

export const PLACEHOLDER_CLS = cn(
  'min-w-0 flex flex-row gap-x-2 items-center grow relative border',
  'disabled:cursor-not-allowed data-[readonly=true]:bg-muted/40'
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
  'placeholder:opacity-60 outline-hidden border-none ring-none min-w-0 grow',
  'peer w-full border-b-2 border-gray-300 bg-transparent pt-6 pb-2 px-0 text-base text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500'
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

export function Input3({
  ref,
  id,
  value,
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
  placeholder,
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

  const [_id] = useState(id ?? randId('input'))

  return (
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
        <input
          id={_id}
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
          value={value}
          placeholder={placeholder}
          {...props}
        />

        <Label
          htmlFor={_id}
          className={`absolute left-0 text-gray-500 text-base transition-all duration-200 transform origin-[0]
           
          peer-placeholder-shown:top-6 
          peer-placeholder-shown:text-xs 
          peer-placeholder-shown:text-gray-400 
          peer-focus:top-0
          peer-focus:text-xs 
          peer-focus:text-blue-500 
          ${value ? 'text-blue-500' : ''}
        `}
        >
          {placeholder}
        </Label>

        {rightChildren && rightChildren}
        {error && <WarningIcon stroke="stroke-destructive" w="w-4 h-4" />}
      </VCenterRow>
      {otherChildren && otherChildren}
    </VCenterRow>
  )
}
