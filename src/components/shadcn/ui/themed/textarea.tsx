import { FOCUS_INSET_RING_CLS } from '@/theme'
import { BaseCol } from '@layout/base-col'
import { cn } from '@lib/shadcn-utils'

import { VCenterRow } from '@components/layout/v-center-row'
import { randId } from '@lib/id'
import { cva, type VariantProps } from 'class-variance-authority'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Label } from './label'

export const TEXTAREA_GROUP_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'relative data-[readonly=true]:bg-muted/40'
)

export const textareaVariants = cva(TEXTAREA_GROUP_CLS, {
  variants: {
    variant: {
      default:
        'bg-background border border-border rounded-theme hover:border-ring overflow-hidden p-3',
      dialog:
        'bg-background border border-border rounded-theme hover:border-ring shadow-sm p-3',
      underline:
        'bg-background border-b border-border hover:border-ring px-1 py-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const TEXT_CLS =
  'h-full text-foreground disabled:cursor-not-allowed disabled:opacity-50 outline-hidden ring-none read-only:opacity-50 w-full grow'

export interface ITextAreaProps
  extends ComponentProps<'textarea'>,
    VariantProps<typeof textareaVariants> {
  label?: string | undefined
  labelPos?: 'left' | 'top'
  labelW?: string
  labelChildren?: ReactNode
  lines?: string[]
  textareaCls?: string | undefined
  onTextChange?: (v: string) => void
  onTextChanged?: (v: string) => void
  onLinesChange?: (v: string[]) => void
  onLinesChanged?: (v: string[]) => void
}

function toLines(text: string): string[] {
  return text.split(/[\r\n]+/g)
}

export function Textarea({
  ref,
  id,
  textareaCls,
  className,
  value,
  lines,
  disabled,
  readOnly,
  label,
  labelPos = 'top',
  labelW = 'min-w-24',
  labelChildren,
  variant,
  onChange,
  onTextChange,
  onTextChanged,
  onLinesChange,
  onLinesChanged,
  ...props
}: ITextAreaProps) {
  //const [_value, setInputValue] = useState("")
  const [focus, setFocus] = useState(false)
  //function _onChange(event: ChangeEvent<HTMLTextAreaElement>) {
  //  setInputValue(event.target.value)
  //}

  const _id = id ?? randId('textarea')

  let ret: ReactNode = (
    <BaseCol
      className={textareaVariants({
        variant,
        className,
      })}
      data-enabled={!disabled}
      data-readonly={readOnly}
      data-focus={focus}
      onFocus={() => {
        setFocus(true)
      }}
      onBlur={() => {
        setFocus(false)
      }}
    >
      <textarea
        id={_id}
        disabled={disabled}
        className={cn(TEXT_CLS, textareaCls)}
        ref={ref}
        value={lines ? lines.join('\n') : value}
        readOnly={readOnly}
        onChange={(e) => {
          onTextChange?.(e.currentTarget.value)
          onLinesChange?.(toLines(e.currentTarget.value))
          onChange?.(e)
        }}
        onKeyDown={(e) => {
          //console.log(e)
          if (e.key === 'Enter') {
            onTextChanged?.(e.currentTarget.value)
            onLinesChanged?.(toLines(e.currentTarget.value))
          }
        }}
        {...props}
      />
    </BaseCol>
  )

  if ((label || labelChildren) && labelPos === 'top') {
    ret = (
      <BaseCol className={cn('gap-y-1')}>
        <VCenterRow className="gap-x-2">
          <Label
            className={cn(
              'text-sm font-bold text-foreground/80 px-0.5',
              labelW
            )}
            htmlFor={_id}
          >
            {label}
          </Label>

          {labelChildren && labelChildren}
        </VCenterRow>
        {ret}
      </BaseCol>
    )
  }

  return ret
}
