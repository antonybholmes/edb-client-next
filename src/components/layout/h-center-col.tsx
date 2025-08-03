import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'

import { BaseCol } from './base-col'

export function HCenterCol({ className, children, ...props }: IDivProps) {
  return (
    <BaseCol className={cn('items-center', className)} {...props}>
      {children}
    </BaseCol>
  )
}
