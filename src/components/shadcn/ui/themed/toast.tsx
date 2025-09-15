import { LoadingSpinner } from '@components/alerts/loading-spinner'
import { CloseIcon } from '@icons/close-icon'
import { ErrorIcon } from '@icons/error-icon'
import { WarningIcon } from '@icons/warning-icon'
import type { IChildrenProps } from '@interfaces/children-props'
import { VCenterCol } from '@layout/v-center-col'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
import * as ToastPrimitives from '@radix-ui/react-toast'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps, type ReactNode } from 'react'
import { Button } from './button'
import { dispatch } from './use-toast'

export interface IToast extends VariantProps<typeof toastVariants> {
  id: string | number
  title: string
  description?: ReactNode
  button?:
    | {
        label?: string | undefined
        onClick: () => void
      }
    | undefined
  durationMs?: number | undefined
}

export const toastVariants = cva(
  cn(
    'group w-full md:w-120 relative flex flex-row w-full text-sm items-center justify-between space-x-4 overflow-hidden rounded-theme border p-4 shadow-lg',
    'transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
    'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    'data-[state=open]:slide-in-from-top-10',
    'data-[state=closed]:slide-out-to-top-10'
  ),
  {
    variants: {
      variant: {
        default: 'border-border bg-background text-foreground',
        success:
          'border-emerald-300 bg-background text-emerald-700 bg-emerald-50',
        destructive: 'destructive border-destructive bg-background',
        warning: 'warning border-warning bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// const Toast = forwardRef<
//   ComponentRef<typeof ToastPrimitives.Root>,
//   ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
//     VariantProps<typeof toastVariants>
// >(({ className, variant, duration = 60000, ...props }, ref) => {
//   return (
//     <ToastPrimitives.Root
//       ref={ref}
//       className={cn(toastVariants({ variant }), className)}
//       duration={duration}
//       {...props}
//     />
//   )
// })
// Toast.displayName = ToastPrimitives.Root.displayName

// const ToastAction = forwardRef<
//   ComponentRef<typeof ToastPrimitives.Action>,
//   ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Action
//     ref={ref}
//     className={cn(
//       'inline-flex h-8 shrink-0 items-center justify-center rounded-theme border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 hover:group-[.destructive]:border-destructive/30 hover:group-[.destructive]:bg-destructive hover:group-[.destructive]:text-destructive-foreground focus:group-[.destructive]:ring-destructive',
//       className
//     )}
//     {...props}
//   />
// ))
// ToastAction.displayName = ToastPrimitives.Action.displayName

// const TOAST_CLOSE_CLS = cn(
//   'trans-all absolute right-3 top-3 rounded-full w-7 h-7 flex flex-row items-center justify-center opacity-0',
//   'focus:opacity-100 focus:outline-hidden focus:ring-2',
//   'group-hover:opacity-100 hover:bg-muted stroke-foreground',
//   'focus:group-[.destructive]:ring-red-400 focus:group-[.destructive]:ring-offset-red-600',
//   'group-[.destructive]:stroke-background hover:group-[.destructive]:bg-white/20'
// )

// const ToastClose = forwardRef<
//   ComponentRef<typeof ToastPrimitives.Close>,
//   ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Close
//     ref={ref}
//     className={cn(TOAST_CLOSE_CLS, className)}
//     toast-close=""
//     {...props}
//   >
//     <CloseIcon stroke="" />
//   </ToastPrimitives.Close>
// ))
// ToastClose.displayName = ToastPrimitives.Close.displayName

// const ToastTitle = forwardRef<
//   ComponentRef<typeof ToastPrimitives.Title>,
//   ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Title
//     ref={ref}
//     className={cn('text-sm font-semibold', className)}
//     {...props}
//   />
// ))
// ToastTitle.displayName = ToastPrimitives.Title.displayName

// const ToastDescription = forwardRef<
//   ComponentRef<typeof ToastPrimitives.Description>,
//   ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
// >(({ className, ...props }, ref) => (
//   <ToastPrimitives.Description
//     ref={ref}
//     className={cn('text-sm', className)}
//     {...props}
//   />
// ))
// ToastDescription.displayName = ToastPrimitives.Description.displayName

export function ToastSpinner({ children }: IChildrenProps) {
  return (
    <VCenterRow className="gap-x-3">
      <LoadingSpinner />
      {children}
    </VCenterRow>
  )
}

/** A fully custom toast that still maintains the animations and interactions. */
export function Toast({
  ref,
  variant,
  title,
  description,
  button,
  id,
  ...props
}: IToast & ComponentProps<typeof ToastPrimitives.Root>) {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={toastVariants({ variant })}
      {...props}
    >
      <VCenterRow className="gap-x-4">
        <WarningIcon w="w-8 h-8" className="hidden group-[.warning]:block" />
        <ErrorIcon w="w-8 h-8" className="hidden group-[.destructive]:block" />
        <VCenterCol className="gap-y-1">
          <p className="text-sm font-medium  ">{title}</p>
          {typeof description === 'string' ? (
            <p className="text-sm text-foreground/50  ">{description}</p>
          ) : (
            description
          )}
        </VCenterCol>
      </VCenterRow>
      <div className="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden">
        {button?.label ? (
          <button
            className="rounded bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
            onClick={() => {
              button?.onClick()
              dispatch({ type: 'REMOVE_TOAST', toastId: id })
            }}
          >
            {button.label}
          </button>
        ) : (
          <Button
            variant="muted"
            size="icon"
            rounded="full"
            onClick={() => dispatch({ type: 'REMOVE_TOAST', toastId: id })}
            className="cursor-pointer"
          >
            <CloseIcon />
          </Button>
        )}
      </div>
    </ToastPrimitives.Root>
  )
}

// export default function Headless() {
//   return (
//     <button
//       className="relative flex h-10 flex-shrink-0 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-4 text-sm font-medium shadow-sm transition-all hover:bg-[#FAFAFA] dark:bg-[#161615] dark:hover:bg-[#1A1A19] dark:text-white"
//       onClick={() => {
//         toast({
//           title: 'This is a headless toast',
//           description: 'You have full control of styles and jsx, while still having the animations.',
//           button: {
//             label: 'Reply',
//             onClick: () => sonnerToast.dismiss(),
//           },
//         });
//       }}
//     >
//       Render toast
//     </button>
//   );
// }
