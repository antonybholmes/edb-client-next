import { BaseCol } from '@/components/layout/base-col'
import { ContentDiv } from '@/components/layout/content-div'

import { VCenterCol } from '@/components/layout/v-center-col'
import { cn } from '@lib/class-names'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type HTMLAttributes } from 'react'

interface ICardContainerProps extends HTMLAttributes<HTMLDivElement> {
  gap?: string
}

export const CardContainer = forwardRef<HTMLDivElement, ICardContainerProps>(
  ({ className, gap = 'gap-y-4', children }, ref) => (
    <ContentDiv className="py-8" ref={ref}>
      <BaseCol className={cn(gap, className)}>{children}</BaseCol>
    </ContentDiv>
  )
)
CardContainer.displayName = 'CardContainer'

export const CenteredCardContainer = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ children }, ref) => (
  <VCenterCol ref={ref} className="grow">
    <CardContainer>{children}</CardContainer>
  </VCenterCol>
))
CenteredCardContainer.displayName = 'CenteredCardContainer'

export const variants = cva('border border-border/40 rounded-xl', {
  variants: {
    variant: {
      default: 'bg-background p-5',
      content: 'bg-white p-2',
    },
    gap: {
      default: 'gap-y-4',
      sm: 'gap-y-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    gap: 'default',
  },
})

const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & VariantProps<typeof variants>
>(({ variant, gap, className, ...props }, ref) => (
  <BaseCol
    ref={ref}
    className={variants({ variant, gap, className })}
    {...props}
  />
))
Card.displayName = 'Card'

const SecondaryCard = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('rounded-2xl bg-muted text-foreground', className)}
    {...props}
  />
))
SecondaryCard.displayName = 'SecondaryCard'

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5', className)}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-base font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-foreground/50', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn(className)} {...props} />
  )
)
CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex', className)} {...props} />
  )
)
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  SecondaryCard,
}
