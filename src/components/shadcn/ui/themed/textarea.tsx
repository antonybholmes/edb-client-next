import { BaseCol } from '@/layout/base-col'
import { cn } from '@/lib/shadcn-utils'
import type { UndefStr } from '@/lib/text/text'
import { FOCUS_INSET_RING_CLS } from '@/theme'

import { cva, type VariantProps } from 'class-variance-authority'
import { useState, type ComponentProps, type ReactNode } from 'react'

export const TEXTAREA_GROUP_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'relative data-[readonly=true]:bg-muted/40'
)

export const textareaVariants = cva(TEXTAREA_GROUP_CLS, {
  variants: {
    variant: {
      default:
        'bg-background border border-border/50 rounded-theme hover:border-ring overflow-hidden p-1',
      dialog:
        'bg-background border border-border rounded-theme hover:border-ring shadow-sm p-3',
      underline:
        'bg-background border-b border-border hover:border-ring px-1 py-2',
    },
    w: {
      sm: 'w-24',
      md: 'w-32',
      lg: 'w-48',
      xl: 'w-64',
      grow: 'grow',
    },
  },

  defaultVariants: {
    variant: 'default',
    w: 'grow',
  },
})

export const TEXT_CLS = `h-full text-foreground disabled:cursor-not-allowed disabled:opacity-50 p-1
  outline-hidden ring-none read-only:opacity-50 w-full grow custom-scrollbar resize-none bg-transparent`

export interface ITextAreaProps
  extends ComponentProps<'textarea'>, VariantProps<typeof textareaVariants> {
  label?: UndefStr
  labelPos?: 'left' | 'top'
  labelW?: string
  labelChildren?: ReactNode
  lines?: string[]
  textareaCls?: UndefStr
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
  w,
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

  //const _id = id ?? randId('textarea')

  return (
    <BaseCol
      className={textareaVariants({
        variant,
        w,
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
        id={id}
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
          if (e.key === 'Enter') {
            onTextChanged?.(e.currentTarget.value)
            onLinesChanged?.(toLines(e.currentTarget.value))
          }
        }}
        {...props}
      />
    </BaseCol>
  )

  // if ((label || labelChildren) && labelPos === 'top') {
  //   ret = (
  //     <BaseCol className={cn('gap-y-1')}>
  //       <VCenterRow className="gap-x-2">
  //         <Label
  //           className={cn(
  //             'text-sm font-bold text-foreground/80 px-0.5',
  //             labelW
  //           )}
  //           htmlFor={_id}
  //         >
  //           {label}
  //         </Label>

  //         {labelChildren && labelChildren}
  //       </VCenterRow>
  //       {ret}
  //     </BaseCol>
  //   )
  // }

  //return ret
}
