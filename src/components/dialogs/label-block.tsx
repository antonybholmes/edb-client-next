import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { BaseCol } from '../layout/base-col'
import { Label } from '../shadcn/ui/themed/v2/label'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-1')

export function LabelBlock({ title = '', className, children }: IDivProps) {
  return (
    <BaseCol className={cn('gap-y-1', className)}>
      <Label>{title}</Label>

      {children}
    </BaseCol>
  )
}
