import { useStableId } from '@/hooks/stable-id'
import { WarningIcon } from '@/icons/warning-icon'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import type { UndefStr } from '@/lib/text/text'
import { BUTTON_XL_H_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  useEffect,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from 'react'

export const PLACEHOLDER_CLS = cn(
  'min-w-0 flex flex-row items-center',
  'disabled:cursor-not-allowed data-[readonly=true]:bg-muted/40 overflow-hidden'
)

export const inputVariants = cva(PLACEHOLDER_CLS, {
  variants: {
    variant: {
      default:
        'bg-background border border-border/60 rounded-theme hover:border-border px-2',
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
      alt: 'bg-muted/50 hover:bg-muted/80 px-2 stroke-foreground rounded-theme border-2 border-transparent data-[focus=true]:border-ring',
      underline: 'bg-background border-b border-border hover:border-ring px-1',
    },
    h: {
      sm: 'h-7',
      md: 'h-button-md',
      //dialog: 'h-9',
      lg: 'h-9',
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
  id: UndefStr
  placeholder?: UndefStr
  focus?: boolean
  hover?: boolean
  value: string | number | readonly string[] | undefined
  disabled?: boolean
}

export interface IInputProps
  extends ComponentProps<'input'>, VariantProps<typeof inputVariants> {
  error?: boolean
  inputCls?: string
  inputStyle?: CSSProperties
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  otherChildren?: ReactNode

  w?: string
  onTextChange?: (v: string) => void
  onTextChanged?: (v: string) => void
}

export function Input({
  ref,
  id,
  name,
  value,
  leftChildren,
  rightChildren,
  otherChildren,
  type, // = 'text',
  inputCls,
  inputStyle,
  error = false,
  autoComplete = 'off',
  //label,
  //labelPos = 'top',
  //labelW = 'min-w-24',
  variant = 'default',
  h = 'lg',
  gap = 'sm',
  w = 'grow',
  disabled,
  readOnly = false,
  onChange,
  onTextChange,
  onTextChanged,
  style,
  className,
  'aria-label': ariaLabel,
  ...props
}: IInputProps) {
  const _id = id ?? useStableId('input')

  const _name = name ?? _id

  const [_value, setValue] = useState(value ?? '')

  const [focus, setFocus] = useState(false)

  useEffect(() => {
    setValue(value ?? '')
  }, [value])

  return (
    <VCenterRow
      className={inputVariants({
        variant,
        h,
        gap,
        className: cn(w, className),
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

      {/* if user did not provide id, assume not interested in label so add hidden label for accessibility */}
      {!id && (
        <label htmlFor={_id} className="sr-only">
          {ariaLabel ?? _name}
        </label>
      )}

      <input
        id={_id}
        name={_name}
        value={_value}
        //defaultValue={defaultValue}
        type={type}
        className={cn(INPUT_CLS, inputCls)}
        style={inputStyle}
        disabled={disabled}
        readOnly={readOnly}
        autoComplete={autoComplete}
        onChange={(e) => {
          setValue(e.currentTarget.value)
          onTextChange?.(e.currentTarget.value)
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onTextChanged?.(e.currentTarget.value)
          }
        }}
        {...props}
      />

      {rightChildren && rightChildren}
      {error && <WarningIcon stroke="stroke-destructive" size="w-4 h-4" />}
    </VCenterRow>
  )
}
