import { useId, type ReactNode } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import type { ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { InfoHoverCard } from '../shadcn/ui/themed/v2/hover-card'
import { Switch } from '../shadcn/ui/themed/v2/switch'
import { DialogCardInfo } from './card/dialog-card'
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
  tooltip,
  className,

  children,
}: IProps) {
  const id = useId()

  return (
    <BaseCol className="gap-y-1">
      <VCenterRow
        className={cn(
          'gap-x-4 justify-between min-h-6',
          //info ? 'items-start pb-1' : 'items-center',

          className
        )}
      >
        {side == 'left' && (
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
            id={id}
          />
        )}

        {side == 'right' && (
          <label htmlFor={id} className={cn({ 'font-medium': info })}>
            {title}
          </label>
        )}

        <VCenterRow className="gap-x-1.5 justify-end grow overflow-hidden">
          {children && children}
          {tooltip && <InfoHoverCard>{tooltip}</InfoHoverCard>}
          {side == 'right' && (
            <Switch
              id={id}
              checked={checked}
              onCheckedChange={onCheckedChange}
              disabled={disabled}
            />
          )}
        </VCenterRow>

        {side == 'left' && (
          <label htmlFor={id} className={cn({ 'font-medium': info })}>
            {title}
          </label>
        )}
      </VCenterRow>
      {info && <DialogCardInfo>{info}</DialogCardInfo>}
    </BaseCol>
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
