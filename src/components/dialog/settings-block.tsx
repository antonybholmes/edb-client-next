import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { BaseCol } from '../layout/base-col'

export function SettingsBlock({
  title = '',
  description,
  className,
  children,
  addBorder = true,
}: IDivProps & { description?: string; addBorder?: boolean }) {
  return (
    <BaseCol
      className={cn(
        'gap-y-2',
        className,
        addBorder && 'pt-4 pb-8 border-t border-border/50'
      )}
    >
      <h2 className="font-semibold text-lg">{title}</h2>
      {description && (
        <p className="text-sm text-foreground/50">{description}</p>
      )}
      <BaseCol className="gap-y-2 mt-2">{children}</BaseCol>
    </BaseCol>
  )
}
