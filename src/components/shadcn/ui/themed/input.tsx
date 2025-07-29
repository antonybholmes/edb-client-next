import { BUTTON_MD_H_CLS, BUTTON_XL_H_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { WarningIcon } from '@icons/warning-icon'
import type { IDivProps } from '@interfaces/div-props'
import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { Label } from './label'

export const PLACEHOLDER_CLS = cn(
  'min-w-0 flex flex-row items-center grow',
  'disabled:cursor-not-allowed data-[readonly=true]:bg-muted/40 overflow-hidden'
)

export const inputVariants = cva(PLACEHOLDER_CLS, {
  variants: {
    variant: {
      default:
        'bg-background border border-border rounded-theme hover:border-ring px-2',
      dialog: cn(
        'bg-background border border-border rounded-theme hover:border-ring shadow-sm px-3',
        FOCUS_INSET_RING_CLS
      ),
      plain: '',
      trans: 'bg-white/20 hover:bg-white/30 text-white fill-white',
      header: `border border-transparent bg-muted/75 stroke-foreground rounded-theme px-2
        hover:bg-background hover:shadow-xs hover:border-border
        data-[focus=true]:bg-background data-[focus=true]:shadow-xs data-[focus=true]:border-border
        trans-color`,
      alt: 'bg-muted/50 hover:bg-muted/75 px-2 stroke-foreground rounded-theme border-2 border-transparent data-[focus=true]:border-ring',
      underline: 'bg-background border-b border-border hover:border-ring px-1',
    },
    h: {
      sm: 'h-7',
      md: BUTTON_MD_H_CLS,
      dialog: 'h-9',
      lg: 'h-10',
      xl: BUTTON_XL_H_CLS,
      '2xl': 'h-14',
      header: 'h-9',
    },
    gap: {
      sm: 'gap-x-1',
      md: 'gap-x-2',
      lg: 'gap-x-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    h: 'md',
    gap: 'sm',
  },
})

export const INPUT_CLS = cn(
  'disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50 placeholder:opacity-60',
  'outline-hidden border-none ring-none min-w-0 grow'
)

export interface IPlaceholderProps extends IDivProps {
  id: string | undefined
  placeholder?: string | undefined
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
  label?: string | undefined
  labelPos?: 'left' | 'top'
  labelW?: string
  w?: string
  onTextChange?: (v: string) => void
  onTextChanged?: (v: string) => void
}

export function Input({
  ref,
  id,
  value,
  leftChildren,
  rightChildren,
  otherChildren,
  type, // = 'text',
  inputCls,
  inputStyle,
  error = false,
  label,
  labelPos = 'top',
  labelW = 'min-w-24',
  variant = 'default',
  h = 'md',
  gap = 'sm',
  w = 'grow',
  disabled,
  readOnly = false,
  onChange,
  onTextChange,
  onTextChanged,
  style,
  className,
  ...props
}: IInputProps) {
  //const [_id] = useState(id ?? randId('input'))

  const [_value, setValue] = useState(value ?? '')

  const [focus, setFocus] = useState(false)

  useEffect(() => {
    setValue(value ?? '')
  }, [value])

  let ret: ReactNode = (
    <VCenterRow className={cn('gap-x-4', !label && w, !label && className)}>
      {label && labelPos === 'left' && (
        <Label className={labelW} htmlFor={id}>
          {label}
        </Label>
      )}
      <VCenterRow
        className={inputVariants({
          variant,
          h,
          gap,
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
          value={_value}
          //defaultValue={defaultValue}
          type={type}
          className={cn(INPUT_CLS, inputCls)}
          style={inputStyle}
          disabled={disabled}
          readOnly={readOnly}
          onChange={(e) => {
            setValue(e.currentTarget.value)
            onTextChange?.(e.currentTarget.value)
            onChange?.(e)
          }}
          onKeyDown={(e) => {
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
  )

  if (label && labelPos === 'top') {
    ret = (
      <BaseCol className={cn('gap-y-1', w, className)}>
        {label && (
          <Label
            className="text-sm font-bold text-foreground/80 px-0.5"
            htmlFor={id}
          >
            {label}
          </Label>
        )}
        {ret}
      </BaseCol>
    )
  }

  return ret
}
