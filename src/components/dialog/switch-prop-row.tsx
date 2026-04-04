import { type ReactNode } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
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
  side?: 'left' | 'right'
  h?: string
}

export function SwitchPropRow({
  title = '',
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
    title = <span className="truncate shrink-0">{title}</span>
  }

  return (
    <VCenterRow className={cn('gap-x-4', h, className)}>
      {side == 'left' && (
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        >
          {title}
        </Switch>
      )}

      {side == 'right' && title}

      <VCenterRow className="gap-x-2 justify-end grow overflow-hidden">
        {children && children}

        {side == 'right' && (
          <Switch
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={disabled}
          />
        )}
      </VCenterRow>
    </VCenterRow>
  )
}

export function ExtTitle({
  title,
  children,
  className,
}: IChildrenProps & { title: string }) {
  return (
    <VCenterRow className="gap-x-2">
      {children}
      <span>{title}</span>
    </VCenterRow>
  )
}
