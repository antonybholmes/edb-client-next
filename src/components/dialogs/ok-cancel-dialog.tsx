import { BaseCol } from '@/layout/base-col'
import { Button, type IButtonProps } from '@/themed/v2/button'

import {
  contentVariants,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
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
import { X } from 'lucide-react'
import { osName } from 'react-device-detect'
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

export const DIALOG_HEADER_BUTTON_CLS =
  'stroke-alt-foreground hover:stroke-foreground trans-color aspect-square focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[variant=none]:bg-transparent data-[variant=none]:hover:bg-transparent data-[variant=none]:focus-visible:bg-transparent'

export function CloseButton({ ...props }: IButtonProps) {
  return (
    <button
      title={TEXT_CLOSE}
      className={DIALOG_HEADER_BUTTON_CLS}

      {...props}
    >
      <X size={24} stroke="" strokeWidth={2} />
    </button>
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
    VariantProps<typeof overlayVariants> {
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
  // headerVariant = 'default',
  // bodyVariant = 'default',
  // footerVariant = 'default',
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
        className={cn('text-sm flex flex-col p-4 gap-y-4', w, h, className)}
        {...props}
      >
        <DialogHeader
          style={headerStyle}
          className="h-8" //dialogHeaderVariants({ headerVariant })}
        >
          <VCenterRow className="gap-x-2">
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
          <VCenterRow className={cn('gap-x-4 grow')}>
            <ErrorIcon />
            <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
          </VCenterRow>
        )}

        {modalType === 'warning' && (
          <VCenterRow className={cn('gap-x-4 grow')}>
            <WarningIcon />
            <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
          </VCenterRow>
        )}

        {modalType === 'default' && (
          <BaseCol className={cn('grow', bodyCls)}>{children}</BaseCol>
        )}

        <DialogFooter>
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
