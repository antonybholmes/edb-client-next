import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { Checkbox } from '@/components/shadcn/ui/themed/baseui/check-box'
import { Switch } from '@/components/shadcn/ui/themed/baseui/switch'
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
  justify = 'start',
  className,
  children,
  ...props
}: Omit<IDivProps, 'title'> & {
  title?: ReactNode
  text?: ReactNode
  items?: 'start' | 'center' | 'end'
  justify?: 'start' | 'center' | 'end' | 'between'
}) {
  return (
    <div
      className={cn('grid grid-cols-4 gap-x-3 gap-y-2', className)}
      {...props}
    >
      <BaseRow
        className={cn(
          'text-alt-foreground text-right text-sm justify-end ',
          items === 'start' && 'items-start',
          items === 'center' && 'items-center',
          items === 'end' && 'items-end'
        )}
      >
        {title}
      </BaseRow>
      <BaseRow
        className={cn(
          'col-span-3 gap-x-2',
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

export function ActionDialogSeparator() {
  return (
    <ActionDialogRow>
      <div className="border-t border-border w-full my-2" />
    </ActionDialogRow>
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
  text = '',
  tooltip = '',
  checked = false,
  justify,
  onCheckedChange = () => {},
  disabled = false,
  children,
}: ComponentProps<typeof ActionDialogRow> &
  ComponentProps<typeof Checkbox> & { info?: ReactNode }) {
  return (
    <ActionDialogRow justify={justify} title={title}>
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}

        title={tooltip}
      >
        {text}
      </Checkbox>
      {children}
    </ActionDialogRow>
  )
}

export function ActionSwitchRow({
  title = '',
  text = '',
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
    <ActionDialogRow justify={justify} title={title}>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}

        title={tooltip}
        className={switchCls}
      >
        {text}
      </Switch>
      {children}
    </ActionDialogRow>
  )
}
