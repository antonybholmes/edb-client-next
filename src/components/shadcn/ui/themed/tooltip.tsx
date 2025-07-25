import { cn } from '@lib/shadcn-utils'
import type { TooltipContentProps } from '@radix-ui/react-tooltip'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { type ComponentProps } from 'react'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

export function TooltipContent({
  ref,
  className,
  sideOffset = 4,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Content
      sideOffset={sideOffset}
      className={cn(
        'z-(--z-modal) overflow-hidden bg-background border border-border/50',
        'px-4 py-2 text-xs font-medium rounded-theme shadow-xl',
        'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  )
}

export function SimpleTooltip({
  content,
  side = 'bottom',
  children,
}: TooltipContentProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Tooltip, TooltipProvider, TooltipTrigger }
