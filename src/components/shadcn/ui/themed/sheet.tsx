import { cn } from '@lib/shadcn-utils'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import { DialogOverlay } from './dialog'
import { GLASS_CLS } from './glass'

const Sheet = SheetPrimitive.Root

const SheetTrigger = SheetPrimitive.Trigger

const SheetClose = SheetPrimitive.Close

const SheetPortal = SheetPrimitive.Portal

// const SheetOverlay = forwardRef<
//   ElementRef<typeof SheetPrimitive.Overlay>,
//   ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
// >(({ ...props }, ref) => (
//   // <SheetPrimitive.Overlay
//   //   className={cn(
//   //     "fixed inset-0 z-50 bg-background/80 backdrop-blur-xs data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
//   //     className
//   //   )}
//   //   {...props}
//   //   ref={ref}
//   // />

//   <DialogOverlay ref={ref} {...props} />
// ))
// SheetOverlay.displayName = SheetPrimitive.Overlay.displayName

const sheetVariants = cva(
  'fixed z-(--z-modal) outline-hidden transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out data-[state=closed]:duration-300 data-[state=open]:duration-300',
  {
    variants: {
      surface: {
        none: '',
        default: 'bg-background',
        glass: GLASS_CLS,
      },
      shadow: {
        none: '',
        lg: 'shadow-lg',
      },
      side: {
        top: 'inset-x-0 top-0 data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top',
        bottom:
          'inset-x-0 bottom-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
        left: 'inset-y-0 left-0 flex flex-col min-h-screen data-[state=closed]:slide-out-to-left-8 data-[state=open]:slide-in-from-left-8',
        right:
          'inset-y-0 right-0 flex flex-col min-h-screen data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
      },
    },
    defaultVariants: {
      shadow: 'lg',
      surface: 'default',
      side: 'right',
    },
  }
)

interface SheetContentProps
  extends ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  overlayFill?: string
}

const SheetContent = forwardRef<
  ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      shadow = 'lg',
      surface = 'default',
      side = 'right',
      overlayFill = 'bg-foreground/25',
      className,
      children,
      ...props
    },
    ref
  ) => (
    <SheetPortal>
      {overlayFill && <DialogOverlay />}
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ surface, side, shadow }), className)}
        {...props}
      >
        {children}
        {/* <SheetPrimitive.Close className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close> */}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
)
SheetContent.displayName = SheetPrimitive.Content.displayName

const SheetHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = forwardRef<
  ComponentRef<typeof SheetPrimitive.Title>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn('text-lg font-semibold text-foreground', className)}
    {...props}
  />
))
SheetTitle.displayName = SheetPrimitive.Title.displayName

const SheetDescription = forwardRef<
  ComponentRef<typeof SheetPrimitive.Description>,
  ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn('text-sm text-foreground/50', className)}
    {...props}
  />
))
SheetDescription.displayName = SheetPrimitive.Description.displayName

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
