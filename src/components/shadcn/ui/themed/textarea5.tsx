import { FOCUS_INSET_RING_CLS, TRANS_TIME_CLS } from '@/theme'
import { cn } from '@lib/class-names'

import { BaseCol } from '@/components/layout/base-col'
import { forwardRef, useState, type TextareaHTMLAttributes } from 'react'
import type { IPlaceholderProps } from './input'

export const TEXTAREA_GROUP_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'trans-color rounded-theme data-[enabled=true]:hover:border-theme/75',
  'relative rounded-theme p-2 bg-background border data-[enabled=true]:border-border data-[enabled=true]:focus-within:ring-2'
)

export const PLACEHOLDER_CLS = cn(
  TRANS_TIME_CLS,
  'absolute pointer-events-none top-3 z-10 data-[focus=false]:text-foreground/30 data-[focus=true]:text-theme'
)

export const TEXT_CLS =
  'relative w-full h-full text-foreground bg-background disabled:cursor-not-allowed disabled:opacity-50 outline-none ring-none resize-none custom-scrollbar'

export function Placeholder({
  id,
  placeholder,
  focus,
  value,
}: IPlaceholderProps) {
  return (
    <label
      className={PLACEHOLDER_CLS}
      data-focus={focus}
      data-value={value !== ''}
      style={{
        transform: `translateY(${focus || value ? '-0.5rem' : '0'})`,
        fontSize: `${focus || value ? '80%' : '100%'}`,
        fontWeight: `${focus || value ? 'bold' : 'normal'}`,
      }}
      htmlFor={id}
    >
      {focus ? placeholder?.replace('...', '') : placeholder}
    </label>
  )
}

export interface ITextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  textCls?: string
}

export const Textarea5 = forwardRef<HTMLTextAreaElement, ITextAreaProps>(
  (
    { id, className, placeholder, value, disabled = false, textCls, ...props },
    ref
  ) => {
    const [focus, setFocus] = useState(false)
    //const [_value, setInputValue] = useState("")

    //function _onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    //  setInputValue(event.target.value)
    //}

    //console.log(value)

    return (
      <BaseCol
        className={cn(TEXTAREA_GROUP_CLS, className)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        data-enabled={!disabled}
      >
        {placeholder && (
          <Placeholder
            id={id}
            placeholder={placeholder}
            focus={focus}
            value={value}
          />
        )}
        <BaseCol className={cn('grow', [placeholder !== undefined, 'pt-3.5'])}>
          <textarea
            id={id}
            className={cn(TEXT_CLS, textCls)}
            ref={ref}
            value={value}
            //onChange={_onChange}
            {...props}
          />
        </BaseCol>
      </BaseCol>
    )
  }
)
Textarea5.displayName = 'Textarea5'
