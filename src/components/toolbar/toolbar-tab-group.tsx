import { VCenterRow } from '@layout/v-center-row'

import { type IDivProps } from '@interfaces/div-props'
import { useEdbSettings } from '@lib/edb/edb-settings'
import { cn } from '@lib/shadcn-utils'
import { type ReactNode } from 'react'
import { BaseRow } from '../layout/base-row'
import { HCenterCol } from '../layout/h-center-col'

interface IProps extends IDivProps {
  name?: string
}

export function ToolbarTabGroup({
  name,
  title,
  className,
  children,
  ...props
}: IProps) {
  const { settings } = useEdbSettings()
  let ret: ReactNode = (
    <BaseRow
      id={name}
      aria-label={name}
      className={cn('shrink-0 text-xs items-stretch', className)}
      {...props}
    >
      {children}
    </BaseRow>
  )

  if (settings.toolbars.groups.labels.show && title !== undefined) {
    ret = (
      <HCenterCol className="gap-y-1 grow justify-between">
        {ret}
        <VCenterRow className="h-4">
          <span className="text-xxs text-foreground/75 tracking-wide">
            {title}
          </span>
        </VCenterRow>
      </HCenterCol>
    )
  }

  return ret
}
