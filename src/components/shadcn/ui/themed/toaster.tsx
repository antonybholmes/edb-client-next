import { cn } from '@lib/shadcn-utils'
import * as ToastPrimitives from '@radix-ui/react-toast'
import type { ComponentProps } from 'react'
import { Toast } from './toast'
import { useToast } from './use-toast'

const DEFAULT_DURATION_MS = 10000

const ToastProvider = ToastPrimitives.Provider

function ToastViewport({
  ref,
  className,
  ...props
}: ComponentProps<typeof ToastPrimitives.Viewport>) {
  return (
    <ToastPrimitives.Viewport
      ref={ref}
      className={cn(
        'fixed top-0 z-(--z-modal) flex max-h-screen w-full flex-col-reverse gap-y-2 p-4 right-0 md:w-[420px] md:max-w-[420px]',
        className
      )}
      {...props}
    ></ToastPrimitives.Viewport>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  console.log(toasts)

  return (
    <ToastProvider>
      {toasts.map(toast => {
        const id: string = toast.id.toString() ?? ''
        return (
          <Toast
            id={id}
            key={id}
            title={toast.title}
            description={toast.description ?? undefined}
            button={toast.button ?? undefined}
            variant={toast.variant ?? 'default'}
            durationMs={toast.durationMs ?? DEFAULT_DURATION_MS}
          />
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
