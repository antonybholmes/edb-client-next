import { forwardRef, type ForwardedRef, type ReactNode } from 'react'

import { H2_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import { BaseRow } from './layout/base-row'
import { VCenterRow } from './layout/v-center-row'
import type { ICheckboxProps } from './shadcn/ui/themed/check-box'
import { Label } from './shadcn/ui/themed/label'
import { Switch } from './shadcn/ui/themed/switch'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends ICheckboxProps {
  title: string
  labelClassName?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export const SwitchPropRow = forwardRef(function SwitchPropRow(
  {
    title = '',
    labelClassName,
    checked = false,
    onCheckedChange = () => {},
    disabled = false,
    leftChildren,
    rightChildren,
    className,
    children,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseRow
      className={cn('gap-x-2 justify-between items-center h-9', className)}
      ref={ref}
    >
      <VCenterRow className="gap-x-2">
        {leftChildren && leftChildren}
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        >
          {rightChildren && rightChildren}
          <Label className={labelClassName}>{title}</Label>
        </Switch>
      </VCenterRow>

      <VCenterRow className="gap-x-2">{children}</VCenterRow>
    </BaseRow>
  )
})
