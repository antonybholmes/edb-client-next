import { cn } from '@lib/class-names'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import { GLASS_CLS } from './glass'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const BG_CLS = cn(
  'fixed inset-0 z-overlay z-(--z-overlay) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
  'flex flex-row items-center justifiy-center'
)

export const overlayVariants = cva(BG_CLS, {
  variants: {
    overlayVariant: {
      default: '',
      blurred: 'backdrop-blur',
    },
    overlayColor: {
      default: 'bg-foreground/10',
      trans: '',
    },
  },
  defaultVariants: {
    overlayVariant: 'default',
    overlayColor: 'trans',
  },
})

export const dialogHeaderVariants = cva('px-4 py-2 rounded-t-xl', {
  variants: {
    headerVariant: {
      default: '',
      opaque: 'bg-background',
    },
  },
  defaultVariants: {
    headerVariant: 'default',
  },
})

export const dialogBodyVariants = cva('px-4', {
  variants: {
    bodyVariant: {
      default: '',
      opaque: 'bg-background shadow-sm',
    },
  },
  defaultVariants: {
    bodyVariant: 'default',
  },
})

export const dialogFooterVariants = cva('p-4 pt-6 rounded-b-xl', {
  variants: {
    footerVariant: {
      default: '',
      opaque: 'bg-background',
    },
  },
  defaultVariants: {
    footerVariant: 'default',
  },
})

const DialogOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> &
    VariantProps<typeof overlayVariants>
>(({ overlayVariant, overlayColor, className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={overlayVariants({ overlayVariant, overlayColor, className })}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

// data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0
// data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
// data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
// data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]

export const contentVariants = cva(
  cn(
    'fixed left-[50%] top-[50%] z-modal z-(--z-modal) flex translate-x-[-50%] translate-y-[-50%] flex-col',
    'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
    'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
    'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
    'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
    'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[60%] rounded-xl'
  ),
  {
    variants: {
      contentVariant: {
        default: 'bg-background shadow-4xl border border-border',
        glass: cn('border border-border', GLASS_CLS),
        trans: '',
      },
    },
    defaultVariants: {
      contentVariant: 'default',
    },
  }
)

const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content> &
    VariantProps<typeof contentVariants> &
    VariantProps<typeof overlayVariants>
>(
  (
    {
      contentVariant,
      overlayVariant,
      overlayColor,
      className,
      children,
      ...props
    },
    ref
  ) => (
    <DialogPortal>
      <DialogOverlay
        overlayVariant={overlayVariant}
        overlayColor={overlayColor}
      />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          contentVariants({ contentVariant, className }),
          className
        )}
        {...props}
      >
        {children}
        {/* <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-foreground/50">
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close> */}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-1.5 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-row', className)} {...props} />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = forwardRef<
  ComponentRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(' font-medium leading-none capitalize', className)}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = forwardRef<
  ComponentRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn('text-sm text-foreground/50', className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
