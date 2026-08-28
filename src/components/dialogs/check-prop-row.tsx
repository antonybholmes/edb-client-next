import { cn } from '@/lib/shadcn-utils'
import type { ReactNode } from 'react'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import { Checkbox, type ICheckboxProps } from '../shadcn/ui/themed/v2/check-box'
import { DialogCardInfo } from './card/dialog-card'

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
    <BaseCol
      className={cn(
        'gap-x-4 gap-y-1 justify-between',
        //info ? 'items-start pb-1' : 'items-center',

        className
      )}
    >
      <VCenterRow className={cn('grow justify-between gap-x-2', h)}>
        <Checkbox
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          title={tooltip}
          className={cn({ 'font-medium': info })}
        >
          {title}
        </Checkbox>

        {/* {title && (
        <VCenterRow className="grow">
          <span>{title}</span>
          {info && <DialogCardInfo>{info}</DialogCardInfo>}
        </VCenterRow>
      )} */}

        {children && (
          <VCenterRow className="gap-x-1.5 justify-end">{children}</VCenterRow>
        )}
      </VCenterRow>

      {info && <DialogCardInfo>{info}</DialogCardInfo>}

      {/* <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}

          title={tooltip}
        />*/}
    </BaseCol>
  )
}
