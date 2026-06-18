import type { IDivProps } from '@/interfaces/div-props'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { cn } from '@/lib/shadcn-utils'
import { Button } from '@/themed/v2/button'
import type { ComponentProps, ReactNode } from 'react'
import { HCenterCol } from '../layout/h-center-col'
import { HCenterRow } from '../layout/h-center-row'

interface IToolbarColButtonProps extends ComponentProps<typeof Button> {
  icon?: ReactNode
  //largeIcon?: React.ReactNode
}

const TOOLBAR_COL_BUTTON_CLS = `group-data-[ribbon=single]:w-toolbar-button 
  group-data-[ribbon=single]:h-toolbar-button
  group-data-[ribbon=classic]:flex-col 
  group-data-[ribbon=classic]:gap-y-2 
  group-data-[ribbon=classic]:w-large-toolbar-button-width 
  group-data-[ribbon=classic]:h-large-toolbar-button-height`

export function ToolbarColButton({
  className = '',
  icon,
  //largeIcon,
  children,
  ...props
}: IToolbarColButtonProps) {
  const { settings } = useEdbSettings()
  const ribbon = settings.toolbars.ribbon.style

  return (
    <Button
      //variant="flat"
      rounded="theme"
      size="none"
      pad="none"
      className={cn(TOOLBAR_COL_BUTTON_CLS, className)}
      // ripple={ripple}
      {...props}
    >
      {ribbon === 'single' && icon ? icon : children}
    </Button>
  )
}

export function ToolbarColSmallButton({
  className = '',
  icon,
  children,
  ...props
}: IToolbarColButtonProps) {
  const { settings } = useEdbSettings()
  const ribbon = settings.toolbars.ribbon.style

  return (
    <Button
      //variant="flat"
      rounded="theme"
      size="none"
      pad="none"
      className="group-data-[ribbon=single]:w-toolbar-button h-toolbar-button group-data-[ribbon=classic]:w-auto group-data-[ribbon=classic]:pl-1 group-data-[ribbon=classic]:pr-2"
      // ripple={ripple}
      {...props}
    >
      {icon && icon}
      {ribbon === 'classic' && children}
    </Button>
  )
}

export function ToolbarColButtonClassicSpan({
  children,
}: ComponentProps<'span'>) {
  return (
    <span className="group-data-[ribbon=classic]:flex group-data-[ribbon=single]:hidden gap-x-1">
      {children}
    </span>
  )
}

export function ToolbarColButtonSingleSpan({
  children,
}: ComponentProps<'span'>) {
  return (
    <span className="group-data-[ribbon=classic]:hidden group-data-[ribbon=single]:flex gap-x-1">
      {children}
    </span>
  )
}

export function ToolbarColButtonSingleItem({ children }: IDivProps) {
  return (
    <HCenterRow className="group-data-[ribbon=classic]:hidden group-data-[ribbon=single]:flex">
      {children}
    </HCenterRow>
  )
}

export function ToolbarColButtonClassicItem({ children }: IDivProps) {
  return (
    <HCenterCol className="group-data-[ribbon=single]:hidden group-data-[ribbon=classic]:flex gap-y-2">
      {children}
    </HCenterCol>
  )
}
