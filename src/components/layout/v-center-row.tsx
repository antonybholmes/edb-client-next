import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { V_CENTERED_ROW_CLS } from '@/theme'

export function VCenterRow({
  ref,
  className,
  style,
  children,
  'aria-label': ariaLabel,
  title,
  ...props
}: IDivProps) {
  if (!ariaLabel) {
    ariaLabel = title
  }

  return (
    <div
      ref={ref}
      className={cn(V_CENTERED_ROW_CLS, className)}
      style={style}
      aria-label={ariaLabel}
      title={title}
      {...props}
    >
      {children}
    </div>
  )
}
