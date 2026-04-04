import { type ReactNode } from 'react'

import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import { Field } from '@base-ui/react/field'
import { cva, type VariantProps } from 'class-variance-authority'
import { VCenterRow } from '../layout/v-center-row'
import { InfoHoverCard } from '../shadcn/ui/themed/v2/hover-card'

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

export const propRowVariants = cva('flex flex-row gap-x-2', {
  variants: {
    align: {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
    },
  },
  defaultVariants: {
    align: 'center',
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
  labelW = 'auto',
  align,
  contentCls = 'gap-x-2',
  side = 'right',
  h,
  info,
  className,
  children,
}: IProps) {
  return (
    <Field.Root>
      <Field.Label className={propRowVariants({ align, className })}>
        {side === 'right' && (
          <VCenterRow className="gap-x-2">
            <span className={labelVariants({ labelW, h })}>
              {title && title}
            </span>
            {info && <InfoHoverCard>{info}</InfoHoverCard>}
          </VCenterRow>
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
        {side === 'left' && (
          <span className={labelVariants({ labelW })}>{title && title}</span>
        )}
      </Field.Label>
    </Field.Root>
  )
}
