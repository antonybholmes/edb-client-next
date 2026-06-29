import { CloseIcon } from '@/components/icons/close-icon'
import { BaseCol } from '@/components/layout/base-col'
import { TEXT_CLOSE } from '@/consts'
import type { IChildrenProps } from '@/interfaces/children-props'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import styles from './toast.module.css'

import { LoadingSpinnerGradient } from '@/components/alerts/loading-spinner-gradient'
import {
  Toast as ToastPrimitive,
  type ToastRootToastObject,
} from '@base-ui/react/toast'
import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'

export const Provider = ToastPrimitive.Provider
export const Toast = ToastPrimitive.Root
export const Portal = ToastPrimitive.Portal
export const Viewport = ToastPrimitive.Viewport

export const toastVariants = cva(
  cn(
    'group relative flex flex-row w-full text-sm items-start justify-between',
    'shadow-lg',
    'overflow-hidden rounded-lg p-4 trans-all backdrop-blur-sm'
    //'transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out',
    //'data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
    //'data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
    //'data-[state=open]:slide-in-from-top-10',
    //'data-[state=closed]:slide-out-to-top-10'
  ),
  {
    variants: {
      variant: {
        default: 'bg-background/90 border border-border/50',
        glass: 'bg-foreground/30',
        success: 'text-emerald-700 stroke-emerald-700',
        destructive: 'bg-destructive/70 text-white',
        warning: 'warning border-warning bg-background',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export function ToastSpinner({ children }: IChildrenProps) {
  return (
    <VCenterRow className="gap-x-3">
      <LoadingSpinnerGradient />
      {children}
    </VCenterRow>
  )
}

export function ToastContent({
  toast,
  index,
  className,
  ...props
}: ComponentProps<typeof ToastPrimitive.Content> & {
  toast: ToastRootToastObject<any>
  index: number
}) {
  return (
    <ToastPrimitive.Content
      className={cn(
        'flex flex-row gap-x-2 items-start justify-between grow',
        className
      )}
      {...props}
    >
      <BaseCol>
        <ToastPrimitive.Title className="font-bold" />
        <ToastPrimitive.Description />
      </BaseCol>
      <ToastPrimitive.Close aria-label={TEXT_CLOSE}>
        <CloseIcon />
      </ToastPrimitive.Close>
    </ToastPrimitive.Content>
  )
}

export function StackedViewport({ ...props }: ComponentProps<typeof Viewport>) {
  return (
    <Viewport
      className="fixed top-4 right-4 z-(--z-alert) m-0 flex w-96 flex-col gap-y-2 outline-none"
      {...props}
    />
  )
}

export function StackedToast({
  index,
  toast,
  className,
  ...props
}: ComponentProps<typeof Toast> & {
  index: number
}) {
  return (
    <Toast
      toast={toast}
      className={toastVariants({
        variant: (toast?.type ?? 'default') as any,
        className: cn(styles.Toast, className),
      })}
      {...props}
    >
      <ToastContent toast={toast} index={index} />
    </Toast>
  )
}

export function StackedToasts() {
  const { toasts } = ToastPrimitive.useToastManager()
  return (
    <Portal>
      <StackedViewport>
        {toasts.map((toast, index) => (
          <StackedToast key={toast.id} toast={toast} index={index} />
        ))}
      </StackedViewport>
    </Portal>
  )
}
