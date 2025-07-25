import { type ReactNode } from 'react'

import { H2_CLS } from '@/theme'
import { cn } from '@lib/shadcn-utils'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import type { ICheckboxProps } from '../shadcn/ui/themed/check-box'
import { Label } from '../shadcn/ui/themed/label'
import { Switch } from '../shadcn/ui/themed/switch'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-1')

interface IProps extends Omit<ICheckboxProps, 'title'> {
  title: ReactNode
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export function SwitchPropRow({
  title = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  leftChildren,
  rightChildren,
  className,
  children,
}: IProps) {
  return (
    <BaseRow className={cn('gap-x-2 justify-between items-center', className)}>
      <VCenterRow className="gap-x-2">
        {leftChildren && leftChildren}

        {typeof title === 'string' ? (
          <button
            className="cursor-pointer"
            disabled={disabled}
            onClick={() => {
              onCheckedChange(!checked)
            }}
          >
            <Label>{title}</Label>
          </button>
        ) : (
          title
        )}

        {rightChildren && rightChildren}
      </VCenterRow>

      <VCenterRow className="gap-x-2">
        {children && children}
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
        />
      </VCenterRow>
    </BaseRow>
  )
}
