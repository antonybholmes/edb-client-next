import { cn } from '@/lib/shadcn-utils'
import type { ReactNode } from 'react'
import { VCenterRow } from '../layout/v-center-row'
import { type ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { InfoHoverCard } from '../shadcn/ui/themed/v2/hover-card'
import { Switch } from '../shadcn/ui/themed/v2/switch'

interface IProps extends Omit<ICheckboxProps, 'title'> {
  title: ReactNode
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
    <VCenterRow className={cn('gap-x-2 justify-between', h, className)}>
      {/* <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        data-enabled={!disabled}
        title={tooltip}
      >
        {title}

        {info && <InfoHoverCard>{info}</InfoHoverCard>}
      </Checkbox> */}

      <VCenterRow className="gap-x-2  ">
        {title}

        {info && <InfoHoverCard>{info}</InfoHoverCard>}
      </VCenterRow>

      <VCenterRow className="gap-x-1.5 justify-end grow overflow-hidden">
        {children && children}

        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          data-enabled={!disabled}
          title={tooltip}
        />
      </VCenterRow>
    </VCenterRow>
  )
}
