import { cn } from '@/lib/shadcn-utils'
import { type ComponentProps } from 'react'

const OUTER_SPAN_CLS = `relative block min-w-0 w-full max-w-full overflow-hidden`

const INNER_SPAN_CLS = `absolute min-w-0 top-1/2 -translate-y-1/2 left-0 right-0 
  overflow-hidden whitespace-nowrap text-ellipsis text-left`

/**
 * A content container that truncates text reliably in nested flex/layout rows.
 *
 * The key is keeping the outer element shrinkable (`min-w-0`, `w-full`) while the
 * inner span fills the available width and applies the ellipsis. This avoids the
 * common flex bug where a child refuses to shrink and the text simply overflows.
 * Generally a height is required since this component uses absolute positioning
 * and cannot reliably determine its height otherwise.
 */
export function TruncateSpan({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span className={cn(OUTER_SPAN_CLS, className)} {...props}>
      <span className={INNER_SPAN_CLS}>{children}</span>
    </span>
  )
}
