import { VCenterRow } from '@/components/layout/v-center-row'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { useContext, type ReactNode } from 'react'
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
  const { settings } = useContext(EdbSettingsContext)
  let ret: ReactNode = (
    <VCenterRow
      id={name}
      aria-label={name}
      className={cn('shrink-0 text-xs', className)}
      {...props}
    >
      {children}
    </VCenterRow>
  )

  if (settings.toolbars.groups.labels.show && title) {
    ret = (
      <HCenterCol className="gap-y-0.5">
        {ret}
        <span className="text-xxs text-foreground/40">{title}</span>
      </HCenterCol>
    )
  }

  return ret
}
