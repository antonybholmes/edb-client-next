import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { V_CENTERED_ROW_CLS } from '@/theme'

export function VCenterRow({
  ref,
  className,
  style,
  children,
  ...props
}: IDivProps) {
  return (
    <div
      ref={ref}
      className={cn(V_CENTERED_ROW_CLS, className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  )
}
