'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@components/shadcn/ui/themed/toast'

const DEFAULT_DURATION_MS = 10000

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        durationMs,
        onClose,
        ...props
      }) {
        return (
          <Toast
            key={id}
            variant={variant}
            duration={durationMs ?? DEFAULT_DURATION_MS}
            {...props}
          >
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose data-variant={variant} onClick={() => onClose?.()} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
