import { BaseCol } from '@/components/layout/base-col'
import { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { ComponentProps, ReactNode } from 'react'

export function DialogCardInfo({
  className,
  children,
  ...props
}: ComponentProps<'span'>) {
  return (
    <span
      className={cn('text-xs text-alt-foreground font-normal', className)}
      {...props}
    >
      {children}
    </span>
  )
}

// export function DialogCardGroup({
//   title,
//   className,
//   children,
//   ...props
// }: IDivProps) {
//   return (
//     <BaseCol className={cn('gap-y-2', className)} {...props}>
//       {children}
//     </BaseCol>
//   )
// }

export function DialogCardHeader({
  title,
  className,
  children,
  ...props
}: Omit<IDivProps, 'title'> & { title?: ReactNode; info?: string }) {
  return (
    <BaseCol className={cn('text-sm font-semibold', className)} {...props}>
      {title && (typeof title === 'string' ? <h2>{title}</h2> : title)}

      {children}
    </BaseCol>
  )
}

export function DialogCardLabel({
  title,
  className,
  children,
  ...props
}: Omit<IDivProps, 'title'> & { title: ReactNode; info?: string }) {
  return (
    <BaseCol className={className} {...props}>
      {typeof title === 'string' ? <h3>{title}</h3> : title}

      {children}
    </BaseCol>
  )
}

export function DialogCardContent({
  className,
  children,
  ...props
}: IDivProps) {
  return (
    <BaseCol
      className={cn('gap-y-1 bg-muted/25 rounded-xl p-3', className)}
      {...props}
    >
      {children}
    </BaseCol>
  )
}

export function DialogCard({ className, children, ...props }: IDivProps) {
  return (
    <BaseCol className={cn('gap-y-2', className)} {...props}>
      {children}
    </BaseCol>
  )
}
