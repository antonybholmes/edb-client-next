import { BaseCol } from '@/layout/base-col'
import { Button, type IButtonProps } from '@/themed/v2/button'

import {
  contentVariants,
  Dialog,
  dialogBodyVariants,
  DialogContent,
  DialogFooter,
  dialogFooterVariants,
  DialogHeader,
  dialogHeaderVariants,
  DialogTitle,
  overlayVariants,
} from '@/themed/v2/dialog'
//import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { TEXT_CANCEL, TEXT_CLOSE, TEXT_OK } from '@/consts'
import { type IChildrenProps } from '@/interfaces/children-props'
import { type IOpenChange } from '@/interfaces/open-change'
import { VCenterRow } from '@/layout/v-center-row'
import { cn } from '@/lib/shadcn-utils'
import type { CSSProperties, ReactNode } from 'react'

import { config } from '@/config'
import type { UndefStr } from '@/lib/text/text'
import type { VariantProps } from 'class-variance-authority'
import { osName } from 'react-device-detect'
import { CloseIcon } from '../icons/close-icon'
import { ErrorIcon } from '../icons/error-icon'
import { WarningIcon } from '../icons/warning-icon'
import { HCenterRow } from '../layout/h-center-row'
// Try to determine the operating system
const OS = osName

type ButtonOrder = 'auto' | 'primary-first' | 'primary-last'

interface IOSButtonRowProps extends IChildrenProps {
  buttonOrder?: ButtonOrder
}

//export type DialogResponse = (response: string, data?: unknown) => void

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

export type ModalType = 'default' | 'warning' | 'error'
export type ModalResponse<T = unknown> = (
  response: string,
  data?: T | undefined
) => void

export interface IModalProps<T = unknown> extends IOpenChange, IChildrenProps {
  title?: ReactNode
  description?: string
  onResponse?: ModalResponse<T> | undefined
  buttons?: string[]
  buttonOrder?: 'auto' | 'primary-first' | 'primary-last'
  modalType?: ModalType | undefined
  bodyCls?: UndefStr
  w?: string | number
  h?: string | number
}

export interface IOKCancelDialogProps<T = unknown>
  extends
    IModalProps<T>,
    VariantProps<typeof contentVariants>,
    VariantProps<typeof overlayVariants>,
    VariantProps<typeof dialogHeaderVariants>,
    VariantProps<typeof dialogBodyVariants>,
    VariantProps<typeof dialogFooterVariants> {
  showClose?: boolean
  headerChildren?: ReactNode
  leftHeaderChildren?: ReactNode
  rightHeaderChildren?: ReactNode
  centerHeaderChildren?: ReactNode
  headerStyle?: CSSProperties
  leftFooterChildren?: ReactNode
}

export function OKCancelDialog({
  title = config.name,
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
  modalType = 'default',
  w = 'w-11/12 sm:w-3/4 md:w-8/12 xl:w-2/5 2xl:w-1/3',
  h,
  style = {},
  headerChildren,
  leftHeaderChildren,
  rightHeaderChildren,
  centerHeaderChildren,
  headerStyle,
  leftFooterChildren,
  className,
  children,
  ...props
}: IOKCancelDialogProps) {
  function _resp(resp: string) {
    onResponse?.(resp, undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn('text-sm flex flex-col py-6 gap-y-4', w, h, className)}
        {...props}
      >
        <DialogHeader
          style={headerStyle}
          className={dialogHeaderVariants({ headerVariant })}
        >
          <VCenterRow className="gap-x-2 pl-2">
            {leftHeaderChildren && leftHeaderChildren}
            <DialogTitle>{title}</DialogTitle>
            {headerChildren && headerChildren}
          </VCenterRow>
          <VCenterRow className="gap-x-2">
            {rightHeaderChildren && rightHeaderChildren}
            {showClose && (
              <CloseButton
                onClick={() => _resp(TEXT_CANCEL)}
                //className="-mr-3"
              />
            )}
          </VCenterRow>
          {centerHeaderChildren && (
            <HCenterRow className="left-1/2 top-1/2 -translate-1/2 absolute">
              {centerHeaderChildren}
            </HCenterRow>
          )}
        </DialogHeader>

        {modalType === 'error' && (
          <VCenterRow
            className={cn('gap-x-4 grow', dialogBodyVariants({ bodyVariant }))}
          >
            <ErrorIcon />
            <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
          </VCenterRow>
        )}

        {modalType === 'warning' && (
          <VCenterRow
            className={cn('gap-x-4 grow', dialogBodyVariants({ bodyVariant }))}
          >
            <WarningIcon />
            <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
          </VCenterRow>
        )}

        {modalType === 'default' && (
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
  onResponse?: (response: string) => void
}) {
  if (!buttons || buttons.length === 0) {
    return null
  }

  return (
    <OSButtonRow buttonOrder={buttonOrder}>
      <Button
        variant="app-theme"
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
