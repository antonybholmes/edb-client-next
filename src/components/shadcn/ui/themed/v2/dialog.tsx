import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import { Dialog as DialogPrimitive } from '@base-ui/react/dialog'
import { cva, type VariantProps } from 'class-variance-authority'
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ComponentRef,
  type HTMLAttributes,
} from 'react'
import { GLASS_CLS } from '../glass'

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

const BG_CLS = cn(
  'fixed inset-0 min-h-dvh',
  'data-open:animate-in data-closed:animate-out',
  'data-closed:fade-out-0 data-open:fade-in-0',
  'data-starting-style:fade-out-0 data-ending-style:fade-in-0',
  'flex flex-row items-center justifiy-center'
)

export const overlayVariants = cva(BG_CLS, {
  variants: {
    overlayVariant: {
      default: '',
      blurred: 'backdrop-blur-sm',
    },
    overlayColor: {
      default: 'bg-foreground/20',
      trans: '',
    },
  },
  defaultVariants: {
    overlayVariant: 'default',
    overlayColor: 'default',
  },
})

export const contentVariants = cva(
  cn(
    'fixed left-[50%] top-[50%]',
    'translate-x-[-50%] translate-y-[-50%]',
    'flex flex-col rounded-xl shadow-3xl'
  ),
  {
    variants: {
      contentVariant: {
        default: 'bg-background',
        glass: GLASS_CLS,
        trans: '',
      },
      animation: {
        default: 'duration-200 data-open:animate-in data-closed:animate-out',
        none: '',
      },
      motion: {
        default:
          'data-open:slide-in-from-top-10 data-closed:slide-out-to-top-10',
        none: '',
      },
      fade: {
        default: 'data-open:fade-in-0 data-closed:fade-out-0',
        none: '',
      },
      zoom: {
        default: 'data-open:zoom-in-95 data-closed:zoom-out-95',
        none: '',
      },
    },
    defaultVariants: {
      contentVariant: 'default',
      animation: 'default',
      motion: 'default',
      fade: 'default',
      zoom: 'default',
    },
  }
)

export const dialogHeaderVariants = cva('relative px-3', {
  variants: {
    headerVariant: {
      default: '-mt-3',
      opaque: 'bg-background m-4',
    },
  },
  defaultVariants: {
    headerVariant: 'default',
  },
})

export const dialogBodyVariants = cva('', {
  variants: {
    bodyVariant: {
      default: 'px-6',
      opaque: 'bg-background',
      card: 'mx-5 p-5 bg-background rounded-card border border-border/50',
    },
  },
  defaultVariants: {
    bodyVariant: 'default',
  },
})

export const dialogFooterVariants = cva('', {
  variants: {
    footerVariant: {
      default: 'px-6',
      line: 'mt-10 mx-5 py-5 border-t border-border/50',
      opaque: 'bg-background',
    },
  },
  defaultVariants: {
    footerVariant: 'default',
  },
})

const DialogOverlay = forwardRef<
  ComponentRef<typeof DialogPrimitive.Backdrop>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Backdrop> &
    VariantProps<typeof overlayVariants>
>(({ overlayVariant, overlayColor, className, ...props }, ref) => (
  <DialogPrimitive.Backdrop
    ref={ref}
    className={overlayVariants({ overlayVariant, overlayColor, className })}
    //style={{ backgroundColor: 'red' }}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Backdrop.displayName

// data-open:animate-in data-closed:animate-out data-closed:fade-out-0
// data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95
// data-closed:slide-out-to-left-1/2 data-closed:slide-out-to-top-[48%]
// data-open:slide-in-from-left-1/2 data-open:slide-in-from-top-[48%]

const DialogContent = forwardRef<
  ComponentRef<typeof DialogPrimitive.Popup>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Popup> &
    VariantProps<typeof contentVariants> &
    VariantProps<typeof overlayVariants>
>(
  (
    {
      contentVariant,
      overlayVariant,
      overlayColor,
      animation,
      fade,
      motion,
      zoom,
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
      {/* <DialogPrimitive.Viewport> */}
      <DialogPrimitive.Popup
        ref={ref}
        className={cn(
          contentVariants({
            contentVariant,
            animation,
            motion,
            fade,
            zoom,
            className,
          }),
          className
        )}
        {...props}
      >
        {children}
        {/* <DialogPrimitive.Close className="absolute right-4 top-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-open:bg-muted data-open:text-foreground/50">
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close> */}
      </DialogPrimitive.Popup>
      {/* </DialogPrimitive.Viewport> */}
    </DialogPortal>
  )
)
DialogContent.displayName = DialogPrimitive.Popup.displayName

const DialogHeader = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <VCenterRow className={cn('justify-between', className)} {...props} />
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
    className={cn('text-base font-semibold truncate', className)}
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
