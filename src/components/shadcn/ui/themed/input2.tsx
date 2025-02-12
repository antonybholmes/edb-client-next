import { FOCUS_RING_CLS, INPUT_BORDER_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import * as React from 'react'
import { useState } from 'react'
import { Placeholder, TEXTAREA_GROUP_CLS } from './textarea1'

const INPUT_CLS = cn(
  'flex h-10 rounded-theme bg-background px-3 placeholder:text-foreground/50 disabled:cursor-not-allowed disabled:opacity-50 read-only:opacity-50',
  INPUT_BORDER_CLS,
  FOCUS_RING_CLS
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input2 = React.forwardRef<HTMLInputElement, InputProps>(
  ({ id, placeholder, value, className, type, ...props }, ref) => {
    const [focus, setFocus] = useState(false)

    return (
      <div
        className={TEXTAREA_GROUP_CLS}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
      >
        <Placeholder
          id={id}
          placeholder={placeholder}
          focus={focus}
          value={value}
        />
        <input
          type={type}
          value={value}
          className={cn(INPUT_CLS, className)}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
