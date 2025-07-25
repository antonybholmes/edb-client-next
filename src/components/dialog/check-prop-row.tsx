import { cn } from '@lib/shadcn-utils'
import { VCenterRow } from '../layout/v-center-row'
import { Checkbox, type ICheckboxProps } from '../shadcn/ui/themed/check-box'
import { Label } from '../shadcn/ui/themed/label'

export function CheckPropRow({
  title = '',
  tooltip,
  checked = false,
  onCheckedChange = () => {},
  disabled = false,
  className,
  children,
}: ICheckboxProps & { title: string; labelClassName?: string }) {
  return (
    <VCenterRow className="gap-x-2 justify-between min-h-8">
      <VCenterRow className={cn('gap-x-2', className)}>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          data-enabled={!disabled}
          title={tooltip}
        />

        <Label title={tooltip}>{title}</Label>
      </VCenterRow>

      {children && children}
    </VCenterRow>
  )
}
