import { type ReactNode } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { BaseCol } from '../layout/base-col'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import type { ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { Switch } from '../shadcn/ui/themed/v2/switch'
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
  children,
}: IProps) {
  // if title is string, wrap it in span with labelVariants
  if (typeof title === 'string') {
    title = <span className={cn('truncate shrink-0 font-medium')}>{title}</span>
  }

  return (
    <BaseRow
      className={cn(
        'gap-x-4',
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
        <BaseCol className="gap-y-px">
          {title}
          {info && <span className="text-xs opacity-60">{info}</span>}
        </BaseCol>
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
