import { type IModalProps } from '@dialog/ok-cancel-dialog'
import { Children } from 'react'

import { TEXT_CANCEL } from '@/consts'
import { BaseCol } from '@layout/base-col'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  overlayVariants,
} from '@themed/dialog'
import { cva, type VariantProps } from 'class-variance-authority'

export const glassDialogVariants = cva('text-sm grid', {
  variants: {
    size: {
      default: 'w-9/10 xl:w-3/4 2xl:w-1/2',
      large: 'w-9/10 xl:w-3/4 2xl:w-3/5',
    },
    height: {
      default: 'min-h-1/2',
      lg: 'h-3/5',
    },
  },
  defaultVariants: {
    size: 'default',
    height: 'default',
  },
})

export interface IBaseGlassDialogProps
  extends IModalProps,
    VariantProps<typeof glassDialogVariants>,
    VariantProps<typeof overlayVariants> {
  open?: boolean
  span?: number
  cols?: number
}

export function BaseGlassSideDialog({
  title = '',
  description = '',
  size,
  height,
  open = true,
  span = 1,
  cols = 4,
  overlayColor = 'trans',
  onResponse = () => {},
  onOpenChange = () => {},
  className,
  children,
}: IBaseGlassDialogProps) {
  const c = Children.toArray(children)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={() => onResponse?.(TEXT_CANCEL)}
        className={glassDialogVariants({
          size,
          height,
          className, //: cn('shadow-glass dark:shadow-dark-glass', className),
        })}
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        contentVariant="glass"
        animation="none"
        overlayColor={overlayColor}
      >
        <BaseCol
          className="p-4 gap-y-4"
          style={{ gridColumn: `span ${span} / span ${span}` }}
        >
          {c[0]!}
        </BaseCol>

        <BaseCol
          className="bg-background rounded-r-lg border-l border-border/75 p-5 gap-y-4"
          style={{ gridColumn: `span ${cols - span} / span ${cols - span}` }}
        >
          {c[1]!}
        </BaseCol>

        <VisuallyHidden asChild>
          <DialogDescription>{description ?? title}</DialogDescription>
        </VisuallyHidden>
      </DialogContent>
    </Dialog>
  )
}
