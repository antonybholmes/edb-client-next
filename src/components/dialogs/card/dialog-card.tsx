import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { ComponentProps } from 'react'

export function DialogCardInfo({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span className={cn('text-xs opacity-70', className)} {...props}>
      {children}
    </span>
  )
}

export function DialogCardHeader({
  title,
  className,
  children,
  ...props
}: IDivProps & { title: string }) {
  return (
    <BaseRow className={cn('gap-x-1 justify-between', className)} {...props}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </BaseRow>
  )
}

export function DialogCardContent({
  className,
  children,
  ...props
}: IDivProps) {
  return (
    <BaseCol className={cn('gap-y-1', className)} {...props}>
      {children}
    </BaseCol>
  )
}

export function DialogCard({ className, children, ...props }: IDivProps) {
  return (
    <BaseCol
      className={cn('gap-y-2 bg-muted/25 rounded-xl p-3', className)}
      {...props}
    >
      {children}
    </BaseCol>
  )
}
