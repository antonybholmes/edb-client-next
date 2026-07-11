import { type ReactNode } from 'react'

import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { cva, type VariantProps } from 'class-variance-authority'
import { BaseCol } from '../layout/base-col'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

export const H_CLS = 'min-h-8'

export const labelVariants = cva('truncate items-center flex flex-row', {
  variants: {
    labelW: {
      none: '',
      xs: 'min-w-16',
      sm: 'min-w-24',
      md: 'min-w-32',
      lg: 'min-w-48',
      xl: 'min-w-64',
      auto: 'grow',
    },
    h: {
      default: H_CLS,
    },
  },
  defaultVariants: {
    labelW: 'sm',
    h: 'default',
  },
})

export const propRowVariants = cva('', {
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
    gap: {
      none: '',
      default: 'gap-x-2',
      lg: 'gap-x-4',
    },
  },

  defaultVariants: {
    align: 'center',
    gap: 'default',
  },
})

interface IProps
  extends
    Omit<IDivProps, 'title'>,
    VariantProps<typeof labelVariants>,
    VariantProps<typeof propRowVariants> {
  title: ReactNode

  items?: string
  contentCls?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  breakpoint?: number
  info?: string
  side?: 'left' | 'right'
}

export function PropRow({
  title,

  align,
  gap,
  contentCls = 'gap-x-1.5',
  side = 'right',
  h,
  info,
  tooltip,
  className,
  children,
}: IProps) {
  return (
    <BaseRow
      className={propRowVariants({
        align,
        gap,
        className: cn(info ? 'items-start pb-1' : 'items-center', className),
      })}
    >
      {side === 'right' && (
        <BaseCol className="gap-y-px max-w-2/3">
          <span className={cn('truncate shrink-0 font-medium')}>{title}</span>
          {info && <span className="text-xs opacity-60">{info}</span>}
        </BaseCol>
      )}
      <VCenterRow
        className={cn(
          'overflow-hidden grow',
          { 'justify-end': side === 'right' },
          contentCls
        )}
      >
        {children}
      </VCenterRow>
      {/* {side === 'left' && (
        <span className={labelVariants({ labelW })}>{title && title}</span>
      )} */}
    </BaseRow>
  )
}
