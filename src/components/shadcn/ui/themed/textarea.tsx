import { FOCUS_INSET_RING_CLS } from '@/theme'
import { cn } from '@lib/class-names'

import { forwardRef, type TextareaHTMLAttributes } from 'react'

export const TEXTAREA_GROUP_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'relative rounded-theme bg-background data-[readonly=true]:bg-muted/40 focus-within:ring-2 rounded-theme border border-border p-2'
)

export const TEXT_CLS =
  'w-full h-full text-foreground disabled:cursor-not-allowed disabled:opacity-50 outline-none ring-none read-only:opacity-50'

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ id, className, value, disabled, readOnly, ...props }, ref) => {
    //const [_value, setInputValue] = useState("")

    //function _onChange(event: ChangeEvent<HTMLTextAreaElement>) {
    //  setInputValue(event.target.value)
    //}

    //console.log(value)

    return (
      <div
        className={cn(TEXTAREA_GROUP_CLS, className)}
        data-enabled={!disabled}
        data-readonly={readOnly}
      >
        <textarea
          id={id}
          disabled={disabled}
          className={TEXT_CLS}
          ref={ref}
          value={value}
          readOnly={readOnly}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
