import { BaseCol } from '@/components/layout/base-col'
import { Button } from '@components/shadcn/ui/themed/button'

import {
  contentVariants,
  Dialog,
  dialogBodyVariants,
  DialogContent,
  DialogDescription,
  DialogFooter,
  dialogFooterVariants,
  DialogHeader,
  dialogHeaderVariants,
  DialogTitle,
  overlayVariants,
} from '@components/shadcn/ui/themed/dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { VCenterRow } from '@/components/layout/v-center-row'
import { APP_NAME, TEXT_CANCEL, TEXT_CLOSE, TEXT_OK } from '@/consts'
import { type IChildrenProps } from '@interfaces/children-props'
import { type IOpenChange } from '@interfaces/open-change'
import { cn } from '@lib/class-names'
import type { CSSProperties, ReactNode } from 'react'

import type { VariantProps } from 'class-variance-authority'
import { osName } from 'react-device-detect'
import { CloseIcon } from '../icons/close-icon'
import { WarningIcon } from '../icons/warning-icon'

// Try to determine the operating system
const OS = osName

type ButtonOrder = 'auto' | 'primary-first' | 'primary-last'

interface IOSButtonRowProps extends IChildrenProps {
  buttonOrder?: ButtonOrder
}

export function OSButtonRow({
  buttonOrder = 'auto',
  className,
  children,
}: IOSButtonRowProps) {
  return (
    <VCenterRow
      data-rev={
        (buttonOrder === 'auto' && OS !== 'Windows') ||
        buttonOrder === 'primary-last'
      }
      className={cn(
        'gap-x-2 data-[rev=true]:flex-row-reverse data-[rev=true]:justify-start data-[rev=false]:justify-end',
        className
      )}
    >
      {children}
    </VCenterRow>
  )
}

export interface IModalProps extends IOpenChange, IChildrenProps {
  onReponse?: (response: string) => void
  buttonOrder?: 'auto' | 'primary-first' | 'primary-last'
  modalType?: 'Default' | 'Warning' | 'Error'
  bodyCls?: string | undefined
}

export interface IOKCancelDialogProps
  extends IModalProps,
    VariantProps<typeof contentVariants>,
    VariantProps<typeof overlayVariants>,
    VariantProps<typeof dialogHeaderVariants>,
    VariantProps<typeof dialogBodyVariants>,
    VariantProps<typeof dialogFooterVariants> {
  title?: string
  description?: string
  mainVariant?: string
  onReponse?: (response: string) => void
  buttons?: string[]
  showClose?: boolean
  headerChildren?: ReactNode
  leftHeaderChildren?: ReactNode
  rightHeaderChildren?: ReactNode
  headerStyle?: CSSProperties
  leftFooterChildren?: ReactNode
}

export function OKCancelDialog({
  title = APP_NAME,
  description = '',
  open = true,
  onOpenChange = () => {},
  onReponse = () => {},
  showClose = true,
  buttons = [TEXT_OK, TEXT_CANCEL],
  buttonOrder = 'auto',
  mainVariant = 'theme',
  headerVariant = 'default',
  bodyVariant = 'default',
  footerVariant = 'default',
  bodyCls = 'gap-y-0.5',
  modalType = 'Default',
  className = 'w-11/12 sm:w-3/4 md:w-8/12 lg:w-1/2 3xl:w-1/3',
  headerChildren,
  leftHeaderChildren,
  rightHeaderChildren,
  headerStyle,
  leftFooterChildren,
  children,
  ...props
}: IOKCancelDialogProps) {
  function _resp(resp: string) {
    onReponse?.(resp)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        onEscapeKeyDown={() => _resp(TEXT_CANCEL)}
        className={cn('text-sm flex flex-col', className)}
        {...props}
      >
        <DialogHeader
          style={headerStyle}
          className={dialogHeaderVariants({ headerVariant })}
        >
          <VCenterRow className="-mr-2 justify-between">
            <VCenterRow className="gap-x-2">
              {leftHeaderChildren && leftHeaderChildren}
              <DialogTitle>{title}</DialogTitle>
              {headerChildren && headerChildren}
            </VCenterRow>
            <VCenterRow className="gap-x-2">
              {rightHeaderChildren && rightHeaderChildren}
              {showClose && (
                <Button
                  variant="accent"
                  size="icon-lg"
                  rounded="full"
                  pad="none"
                  onClick={() => _resp(TEXT_CANCEL)}
                  title={TEXT_CLOSE}
                >
                  <CloseIcon strokeWidth={2} w="w-6" />
                </Button>
              )}
            </VCenterRow>
          </VCenterRow>
          <VisuallyHidden asChild>
            <DialogDescription>
              {description ? description : title}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        <BaseCol className={dialogBodyVariants({ bodyVariant })}>
          <VCenterRow className="gap-x-4">
            {modalType === 'Warning' && (
              <WarningIcon stroke="stroke-yellow-400" />
            )}
            <BaseCol className={cn(bodyCls, 'grow')}>{children}</BaseCol>
          </VCenterRow>
        </BaseCol>

        <DialogFooter
          className={dialogFooterVariants({
            footerVariant,
            className: 'justify-between gap-x-2',
          })}
        >
          <VCenterRow className="grow">
            {leftFooterChildren && leftFooterChildren}
          </VCenterRow>
          {buttons.length > 0 && (
            <OSButtonRow buttonOrder={buttonOrder}>
              <Button
                variant={mainVariant}
                onClick={() => _resp(buttons[0]!)}
                className="w-24"
                size="lg"
              >
                {buttons[0]}
              </Button>

              {buttons.slice(1).map((button, bi) => (
                <Button
                  key={bi}
                  onClick={() => _resp(button)}
                  className="w-24"
                  size="lg"
                  variant="secondary"
                >
                  {button}
                </Button>
              ))}
            </OSButtonRow>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    // <TextDialog
    //   title={title}
    //   text={text}
    //   visible={visible}
    //   onCancel={onCancel}
    //   className={className}
    // >
    //   <VCenterRow className="mt-4 justify-end gap-x-2">
    //     <Button aria-label="OK" onClick={onClick}>
    //       OK
    //     </Button>

    //     <DialogCancel aria-label="Cancel" onClick={onCancel}>
    //       Cancel
    //     </DialogCancel>
    //   </VCenterRow>
    // </TextDialog>
  )
}
