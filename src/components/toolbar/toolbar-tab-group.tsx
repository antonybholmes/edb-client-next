import { VCenterRow } from '@/layout/v-center-row'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { type ReactNode } from 'react'
import { BaseRow } from '../layout/base-row'
import { HCenterCol } from '../layout/h-center-col'
import { ToolbarSeparator } from './toolbar-separator'

interface IProps extends IDivProps {
  name?: string
}

const TAB_GROUP_CLS = cn(
  'group-data-[ribbon=single]:min-h-8 shrink-0 text-xs items-start overflow-hidden',
  'group-data-[ribbon=classic]:min-h-16'
)

export function ToolbarTabGroup({
  name,
  title,
  className,
  style,
  children,
  ...props
}: IProps) {
  const { settings } = useEdbSettings()

  let ret: ReactNode = (
    <VCenterRow
      id={name}
      aria-label={name}
      className={cn(TAB_GROUP_CLS, className)}
      style={style}
      {...props}
    >
      {children}
    </VCenterRow>
  )

  if (
    settings.toolbars.groups.labels.mode === 'show' ||
    (settings.toolbars.groups.labels.mode === 'auto' &&
      settings.toolbars.ribbon.style === 'classic')
  ) {
    ret = (
      <HCenterCol className="grow gap-y-0.5">
        {ret}

        <span className="text-xxs text-foreground/75 tracking-wide">
          {title}
        </span>
      </HCenterCol>
    )
  }

  ret = (
    <BaseRow className="gap-x-1">
      {ret}
      <ToolbarSeparator />
    </BaseRow>
  )

  // make a column if we are showing the labels or the ribbon is in classic mode
  // const alignTop =
  //   settings.toolbars.groups.labels.mode === 'show' ||
  //   settings.toolbars.ribbon.style === 'classic'

  return ret
}
