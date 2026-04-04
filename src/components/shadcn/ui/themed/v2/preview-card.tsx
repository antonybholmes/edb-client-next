import { cn } from '@/lib/shadcn-utils'

import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import { type ComponentProps } from 'react'

export const PreviewCard = PreviewCardPrimitive.Root

export const PreviewCardTrigger = PreviewCardPrimitive.Trigger

export function PreviewCardContent({
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PreviewCardPrimitive.Popup> &
  ComponentProps<typeof PreviewCardPrimitive.Positioner>) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner sideOffset={sideOffset}>
        <PreviewCardPrimitive.Popup
          className={cn(
            'overflow-hidden bg-background border border-border/50',
            'px-4 py-2 text-xs font-medium rounded-theme shadow-xl',
            'animate-in fade-in-0 zoom-in-95 data-ending-style:animate-out data-ending-style:fade-out-0',
            'data-ending-style:zoom-out-95',
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export function SimplePreviewCard({
  content,
  side = 'bottom',
  className = '',
  children,
}: ComponentProps<typeof PreviewCardContent>) {
  return (
    <PreviewCard>
      <PreviewCardTrigger>{children}</PreviewCardTrigger>
      <PreviewCardContent side={side} className={className}>
        <p>{content}</p>
      </PreviewCardContent>
    </PreviewCard>
  )
}
