import { cn } from '@/lib/shadcn-utils'
import type { ReactNode } from 'react'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import { type ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { Switch } from '../shadcn/ui/themed/v2/switch'
import { DialogCardInfo, DialogCardLabel } from './card/dialog-card'

interface IProps extends Omit<ICheckboxProps, 'title'> {
  title?: ReactNode
  labelClassName?: string
  h?: string
  info?: string
}

export function CheckPropRow({
  title = '',
  tooltip = '',
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  info,
  h = 'min-h-6',
  className = '',
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
      {/* <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
 
        title={tooltip}
      >
        {title}

        {info && <InfoHoverCard>{info}</InfoHoverCard>}
      </Checkbox> */}

      {title && (
        <DialogCardLabel title={title}>
          {info && <DialogCardInfo>{info}</DialogCardInfo>}
        </DialogCardLabel>
      )}

      <VCenterRow className="gap-x-1.5 justify-end grow">
        {children && children}

        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}

          title={tooltip}
        />
      </VCenterRow>
    </BaseRow>
  )
}
