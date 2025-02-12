import { FOCUS_INSET_RING_CLS, ROUNDED_MD_CLS, TRANS_TIME_CLS } from '@/theme'
import { cn } from '@lib/class-names'

import { forwardRef, useState, type TextareaHTMLAttributes } from 'react'
import type { IPlaceholderProps } from './input'

export const TEXTAREA_GROUP_CLS = cn(
  ROUNDED_MD_CLS,
  FOCUS_INSET_RING_CLS,
  'relative rounded-theme pt-5 pl-2 pr-1 pb-1 bg-background border border-border focus-within:ring-2'
)

export const PLACEHOLDER_CLS = cn(
  TRANS_TIME_CLS,
  'pointer-events-none absolute left-2 top-5 z-10'
)

export const TEXT_CLS =
  'w-full h-full text-foreground disabled:cursor-not-allowed disabled:opacity-50 outline-none ring-none'

export function Placeholder({
  id,
  placeholder,
  focus,
  value,
}: IPlaceholderProps) {
  return (
    <label
      className={cn(PLACEHOLDER_CLS, 'text-foreground/50')}
      style={{
        transform: `translateY(${focus || value ? '-95%' : '0'})`,
        fontSize: `${focus || value ? '85%' : '100%'}`,
      }}
      htmlFor={id}
    >
      {placeholder}
    </label>
  )
}

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea1 = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ id, className, placeholder, value, ...props }, ref) => {
    const [focus, setFocus] = useState(false)
    //const [_value, setInputValue] = useState("")

    //function _onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    //  setInputValue(event.target.value)
    //}

    //console.log(value)

    return (
      <div
        className={cn(TEXTAREA_GROUP_CLS, className)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        {placeholder && (
          <Placeholder
            id={id}
            placeholder={placeholder}
            focus={focus}
            value={value}
          />
        )}

        <textarea
          id={id}
          className={TEXT_CLS}
          ref={ref}
          value={value}
          //onChange={_onChange}
          {...props}
        />
      </div>
    )
  }
)
