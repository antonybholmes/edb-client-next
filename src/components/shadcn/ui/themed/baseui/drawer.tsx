import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import * as React from 'react'

import { cn } from '@/lib/shadcn-utils'
import type { ComponentProps } from 'react'

export const Drawer = DrawerPrimitive.Root

export const DrawerTrigger = DrawerPrimitive.Trigger

const DrawerPortal = DrawerPrimitive.Portal

const DrawerPopup = DrawerPrimitive.Popup

const DrawerViewport = DrawerPrimitive.Viewport

export const DrawerClose = DrawerPrimitive.Close

export function DrawerOverlay({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      className={cn('fixed inset-0 z-50 bg-black/20', className)}
      {...props}
    />
  )
}

export function DrawerContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <DrawerViewport className="fixed inset-0 z-50 flex flex-col">
        <DrawerPopup
          className={cn(
            'bg-background fixed right-0 top-0 h-full  flex flex-col',
            className
          )}
        >
          <DrawerPrimitive.Content className="flex flex-col grow">
            {children}
          </DrawerPrimitive.Content>
        </DrawerPopup>
      </DrawerViewport>
    </DrawerPortal>
  )
}

// const DrawerHeader = ({
//   className,
//   ...props
// }: React.HTMLAttributes<HTMLDivElement>) => (
//   <div
//     className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)}
//     {...props}
//   />
// )
// DrawerHeader.displayName = 'DrawerHeader'

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mt-auto flex flex-col gap-2 p-4', className)}
    {...props}
  />
)
DrawerFooter.displayName = 'DrawerFooter'

export function DrawerTitle({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    />
  )
}

export const DrawerDescription = ({
  className,
  ...props
}: ComponentProps<typeof DrawerPrimitive.Description>) => {
  return (
    <DrawerPrimitive.Description
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}
