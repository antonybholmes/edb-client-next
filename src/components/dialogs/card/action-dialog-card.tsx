import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { ComponentProps, ReactNode } from 'react'

export function ActionDialogCard({ className, children, ...props }: IDivProps) {
  return (
    <BaseCol className={cn('gap-y-2', className)} {...props}>
      {children}
    </BaseCol>
  )
}

export function ActionDialogRow({
  title,
  items = 'center',
  justify = 'between',
  className,
  children,
  ...props
}: IDivProps & {
  title?: ReactNode
  items?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between'
}) {
  return (
    <div
      className={cn('grid grid-cols-20 gap-x-3 gap-y-2', className)}
      {...props}
    >
      <BaseRow
        className={cn(
          'text-alt-foreground text-right text-sm justify-end col-span-5',
          items === 'start' && 'items-start',
          items === 'center' && 'items-center',
          items === 'end' && 'items-end'
        )}
      >
        {title}
      </BaseRow>
      <BaseRow
        className={cn(
          'col-span-10 gap-x-2',
          justify === 'start' && 'justify-start',
          justify === 'center' && 'justify-center',
          justify === 'end' && 'justify-end',
          justify === 'between' && 'justify-between',
          items === 'start' && 'items-start',
          items === 'center' && 'items-center',
          items === 'end' && 'items-end'
        )}
      >
        {children}
      </BaseRow>
    </div>
  )
}

export function ActionDialogCardContent({
  className,
  children,
  ...props
}: IDivProps) {
  return (
    <BaseCol className={cn('gap-y-1.5', className)} {...props}>
      {children}
    </BaseCol>
  )
}

export function ActionCheckRow({
  title = '',
  tooltip = '',
  checked = false,
  justify,
  onCheckedChange = () => {},
  disabled = false,
  children,
}: ComponentProps<typeof ActionDialogRow> &
  ComponentProps<typeof Checkbox> & { info?: ReactNode }) {
  return (
    <ActionDialogRow justify={justify}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}

        title={tooltip}
      >
        {title}
      </Checkbox>
      {children}
    </ActionDialogRow>
  )
}

export function ActionSwitchRow({
  title = '',
  tooltip = '',
  checked = false,
  justify,
  onCheckedChange = () => {},
  disabled = false,
  switchCls,
  children,
}: ComponentProps<typeof ActionDialogRow> &
  ComponentProps<typeof Checkbox> & { info?: ReactNode; switchCls?: string }) {
  return (
    <ActionDialogRow justify={justify}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}

        title={tooltip}
        className={switchCls}
      >
        {title}
      </Switch>
      {children}
    </ActionDialogRow>
  )
}
