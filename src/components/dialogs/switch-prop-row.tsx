import { type ReactNode } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import type { ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { Switch } from '../shadcn/ui/themed/v2/switch'
import { DialogCardInfo, DialogCardLabel } from './card/dialog-card'
import { H_CLS } from './prop-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-1')

interface IProps extends Omit<ICheckboxProps, 'title'> {
  title: ReactNode
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  breakpoint?: number
  info?: string
  side?: 'left' | 'right'
  h?: string
}

export function SwitchPropRow({
  title = '',
  info,
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  side = 'right',
  h = H_CLS,
  className,
  leftChildren,
  children,
}: IProps) {
  return (
    <BaseRow
      className={cn(
        'gap-x-16 justify-between',
        info ? 'items-start pb-1' : 'items-center',
        h,
        className
      )}
    >
      {side == 'left' && (
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        >
          {title}
        </Switch>
      )}

      {side == 'right' && (
        <DialogCardLabel title={title}>
          {info && <DialogCardInfo>{info}</DialogCardInfo>}
        </DialogCardLabel>
      )}

      <VCenterRow className="gap-x-1.5 justify-end grow overflow-hidden">
        {children && children}

        {side == 'right' && (
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
        )}
      </VCenterRow>
    </BaseRow>
  )
}

export function ExtTitle({
  title,
  children,
}: IChildrenProps & { title: string }) {
  return (
    <VCenterRow className="gap-x-2">
      {children}
      <span>{title}</span>
    </VCenterRow>
  )
}
