import { BaseCol } from '@layout/base-col'
import { Button, type IButtonProps } from '@themed/button'

import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
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
} from '@themed/dialog'

import { APP_NAME, TEXT_CANCEL, TEXT_CLOSE, TEXT_OK } from '@/consts'
import { type IChildrenProps } from '@interfaces/children-props'
import { type IOpenChange } from '@interfaces/open-change'
import { VCenterRow } from '@layout/v-center-row'
import { cn } from '@lib/shadcn-utils'
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

export type DialogResponse = (
  response: string,
  data?: Record<string, unknown>
) => void | undefined

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
        'gap-x-2.5 data-[rev=true]:flex-row-reverse data-[rev=true]:justify-start data-[rev=false]:justify-end',
        className
      )}
    >
      {children}
    </VCenterRow>
  )
}

export function CloseButton({ ...props }: IButtonProps) {
  return (
    <Button
      variant="flat"
      size="icon-lg"
      rounded="full"
      title={TEXT_CLOSE}
      {...props}
    >
      <CloseIcon />
    </Button>
  )
}

export interface IModalProps extends IOpenChange, IChildrenProps {
  title?: ReactNode
  description?: string
  onResponse?: DialogResponse
  buttons?: string[]
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
  onResponse?: (response: string) => void

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
  onResponse = () => {},
  showClose = true,
  buttons = [TEXT_OK, TEXT_CANCEL],
  buttonOrder = 'auto',
  headerVariant = 'default',
  bodyVariant = 'default',
  footerVariant = 'default',
  bodyCls = 'gap-y-1',
  modalType = 'Default',
  className = 'w-11/12 sm:w-3/4 md:w-8/12 xl:w-2/5 2xl:w-1/3',
  headerChildren,
  leftHeaderChildren,
  rightHeaderChildren,
  headerStyle,
  leftFooterChildren,
  children,
  ...props
}: IOKCancelDialogProps) {
  function _resp(resp: string) {
    onResponse?.(resp)
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
          className={cn('-mr-2', dialogHeaderVariants({ headerVariant }))}
        >
          <VCenterRow className="gap-x-2">
            {leftHeaderChildren && leftHeaderChildren}
            <DialogTitle>{title}</DialogTitle>
            {headerChildren && headerChildren}
          </VCenterRow>
          <VCenterRow className="gap-x-2">
            {rightHeaderChildren && rightHeaderChildren}
            {showClose && <CloseButton onClick={() => _resp(TEXT_CANCEL)} />}
          </VCenterRow>
          <VisuallyHidden asChild>
            <DialogDescription>
              {description ? description : title}
            </DialogDescription>
          </VisuallyHidden>
        </DialogHeader>

        {modalType === 'Warning' && (
          <VCenterRow
            className={cn('gap-x-4 grow', dialogBodyVariants({ bodyVariant }))}
          >
            <WarningIcon />
            <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
          </VCenterRow>
        )}

        {modalType === 'Default' && (
          <BaseCol
            className={cn('grow', dialogBodyVariants({ bodyVariant }), bodyCls)}
          >
            {children}
          </BaseCol>
        )}

        <DialogFooter
          className={dialogFooterVariants({
            footerVariant,
            className: 'justify-between gap-x-2',
          })}
        >
          <VCenterRow className="grow">
            {leftFooterChildren && leftFooterChildren}
          </VCenterRow>

          <DialogButtons
            buttons={buttons}
            buttonOrder={buttonOrder}
            onResponse={_resp}
          />
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

export function DialogButtons({
  buttons = [],
  buttonOrder = 'auto',
  onResponse = () => {},
}: {
  buttons?: string[]
  buttonOrder?: ButtonOrder
  onResponse?: DialogResponse
}) {
  if (!buttons || buttons.length === 0) {
    return null
  }

  return (
    <OSButtonRow buttonOrder={buttonOrder}>
      <Button
        variant="theme"
        onClick={() => onResponse?.(buttons[0]!)}
        className="w-24"
        size="lg"
        ripple={true}
      >
        {buttons[0]}
      </Button>

      {buttons.slice(1).map((button, bi) => (
        <Button
          key={bi}
          onClick={() => onResponse?.(button)}
          className="w-24"
          size="lg"
          variant="secondary"
        >
          {button}
        </Button>
      ))}
    </OSButtonRow>
  )
}
