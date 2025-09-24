// 'use client'

import { InfoIcon } from '@components/icons/info-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import { cn } from '@lib/shadcn-utils'
import * as HoverCardPrimitive from '@radix-ui/react-hover-card'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

const HoverCard = HoverCardPrimitive.Root

const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = forwardRef<
  ComponentRef<typeof HoverCardPrimitive.Content>,
  ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={cn(
      'z-(--z-overlay) w-64 rounded-theme border border-border/50 bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
))
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

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
  title,
  children,
}: IChildrenProps & { title: string }) {
  return (
    <HoverCard openDelay={300}>
      <HoverCardTrigger className="stroke-foreground/30 data-[state=open]:stroke-theme hover:stroke-theme trans-color">
        <InfoIcon stroke="" />
      </HoverCardTrigger>
      <HoverCardContent className="flex flex-col gap-y-2 text-sm">
        <h4 className="text-sm font-semibold">{title}</h4>
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}

export { HoverCard, HoverCardContent, HoverCardTrigger }
