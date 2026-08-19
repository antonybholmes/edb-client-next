import { ComponentProps } from 'react'

/**
 * A span component that can be bolded without causing layout shifts.
 *
 * @param param0
 * @returns
 */
export function BoldableSpan({ children, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className="boldable-text-tab inline-flex flex-col"
      aria-label={children?.toString()}
      {...props}
    >
      {children}
    </span>
  )
}
