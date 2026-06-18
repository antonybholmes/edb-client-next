'use client'

import { InfoIcon } from '@/components/icons/info-icon'
import type { IChildrenProps } from '@/interfaces/children-props'
import { cn } from '@/lib/shadcn-utils'
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'
import { type ComponentProps } from 'react'
import { SimplePreviewCard } from './preview-card'

export const HoverCard = PreviewCardPrimitive.Root

export const HoverCardTrigger = PreviewCardPrimitive.Trigger

export function HoverCardContent({
  ref,
  className,
  align = 'center',
  side = 'bottom',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof PreviewCardPrimitive.Popup> &
  ComponentProps<typeof PreviewCardPrimitive.Positioner>) {
  return (
    <PreviewCardPrimitive.Portal className="z-100">
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          ref={ref}
          className={cn(
            ' w-64 rounded-theme border border-border/50 bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export function BasicHoverCard({ children }: IChildrenProps) {
  return (
    <HoverCard>
      <HoverCardTrigger className="stroke-foreground/20 fill-foreground/20 data-[state=open]:stroke-foreground/50 hover:stroke-foreground/50 hover:fill-foreground/50 trans-color">
        <InfoIcon stroke="" />
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-y-2 text-sm">
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}

export function InfoHoverCard({
  className = '',
  w = 'w-64',
  children,
}: IChildrenProps & { w?: string }) {
  return (
    // <HoverCard>
    //   <HoverCardTrigger
    //     delay={300}
    //     className="stroke-foreground/30 data-[state=open]:stroke-theme hover:stroke-theme trans-color"
    //   >
    //     <InfoIcon stroke="" />
    //   </HoverCardTrigger>
    //   <HoverCardContent className="flex flex-col gap-y-2 text-sm">
    //     <h4 className="text-sm font-semibold">{title}</h4>
    //     {children}
    //   </HoverCardContent>
    // </HoverCard>

    // <span title={children as string}>
    //   <InfoIcon />
    // </span>

    <SimplePreviewCard
      content={children as string}
      className={cn(w, className)}
    >
      <InfoIcon />
    </SimplePreviewCard>
  )
}
