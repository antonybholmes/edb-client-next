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
import type { ComponentProps, CSSProperties, ReactNode } from 'react'

import { config } from '@/config'
import { IDivProps } from '@/interfaces/div-props'
import { present } from '@/lib/dom-utils'
import type { UndefStr } from '@/lib/text/text'
import { FOCUS_RING_CLS } from '@/theme'
import type { VariantProps } from 'class-variance-authority'
import { X } from 'lucide-react'
import { osName } from 'react-device-detect'
import { ErrorIcon } from '../icons/error-icon'
import { WarningIcon } from '../icons/warning-icon'
import { HCenterCol } from '../layout/h-center-col'
// Try to determine the operating system
const OS = osName

type ButtonOrder = 'auto' | 'primary-first' | 'primary-last' | 'vertical'

interface IOSButtonRowProps extends IChildrenProps {
  buttonOrder?: ButtonOrder
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
  buttonOrder?: ButtonOrder
  modalType?: ModalType | undefined
  bodyCls?: UndefStr
  w?: string | number
  h?: string | number
}

export function OSButtonRow({
  buttonOrder = 'auto',
  className,
  children,
}: IOSButtonRowProps) {
  return (
    <VCenterRow
      data-rev={present(
        (buttonOrder === 'auto' && OS !== 'Windows') ||
          buttonOrder === 'primary-last'
      )}
      className={cn(
        'gap-x-2.5 justify-end data-rev:flex-row-reverse data-rev:justify-start',
        className
      )}
    >
      {children}
    </VCenterRow>
  )
}

export const DIALOG_HEADER_BUTTON_CLS = cn(
  FOCUS_RING_CLS,
  'stroke-alt-foreground hover:stroke-foreground',
  'trans-color aspect-square -mr-1'
)

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

interface IDialogToolbarProps<T = unknown> extends IDivProps {
  onResponse?: ModalResponse<T> | undefined
  side?: 'left' | 'right'
  justify?: 'start' | 'center' | 'end' | 'between'
}

export function DialogToolbar<T = unknown>({
  onResponse,
  side = 'right',
  justify = 'between',
  className,
  children,
  ...props
}: IDialogToolbarProps<T>) {
  return (
    <DialogHeader
      className={cn(
        'flex flex-row items-center h-8 gap-x-4 relative',

        className
      )} //dialogHeaderVariants({ headerVariant })}
      {...props}
    >
      {side === 'left' && onResponse && (
        <CloseButton onClick={() => onResponse(TEXT_CANCEL)} />
      )}

      <VCenterRow
        className={cn(
          'grow gap-x-2',
          justify === 'start' && 'justify-start',
          justify === 'center' && 'justify-center',
          justify === 'end' && 'justify-end',
          justify === 'between' && 'justify-between'
        )}
      >
        {children}
      </VCenterRow>

      {side === 'right' && onResponse && (
        <CloseButton onClick={() => onResponse(TEXT_CANCEL)} />
      )}
    </DialogHeader>
  )
}

export function DialogFloatingToolbar({
  onResponse,
  className,
  children,
  ...props
}: ComponentProps<typeof DialogToolbar>) {
  return (
    <DialogToolbar
      className={cn(
        'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10',
        className
      )}
      onResponse={onResponse}
      {...props}
    >
      {children}
    </DialogToolbar>
  )
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
        className={cn(
          'text-sm flex flex-col p-4 pt-3 gap-y-4',
          w,
          h,
          className
        )}
        {...props}
      >
        <DialogToolbar
          style={headerStyle}
          onResponse={showClose ? _resp : undefined}
        >
          <VCenterRow className="gap-x-2 grow">
            {leftHeaderChildren && leftHeaderChildren}
            {typeof title === 'string' ? (
              <DialogTitle>{title}</DialogTitle>
            ) : (
              title
            )}
            {headerChildren && headerChildren}
          </VCenterRow>

          {rightHeaderChildren && rightHeaderChildren}

          {centerHeaderChildren && (
            <DialogFloatingToolbar>
              {centerHeaderChildren}
            </DialogFloatingToolbar>
          )}
        </DialogToolbar>

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

        <DialogFooter
          className={cn(buttonOrder === 'vertical' && 'flex-col gap-y-2')}
        >
          {buttonOrder !== 'vertical' && (
            <VCenterRow className="grow">
              {leftFooterChildren && leftFooterChildren}
            </VCenterRow>
          )}

          <DialogButtons
            buttons={buttons}
            buttonOrder={buttonOrder}
            onResponse={_resp}
          />

          {buttonOrder === 'vertical' && (
            <VCenterRow className="grow">
              {leftFooterChildren && leftFooterChildren}
            </VCenterRow>
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

  if (buttonOrder === 'vertical') {
    return (
      <HCenterCol className="gap-y-2  ">
        <Button
          variant="app-theme"
          onClick={() => onResponse?.(buttons[0]!)}
          className="w-full"
          size="lg"
          ripple={true}
        >
          {buttons[0]}
        </Button>

        {buttons.slice(1).map((button, bi) => (
          <Button
            key={bi}
            onClick={() => onResponse?.(button)}
            className="w-full"
            size="lg"
            variant="secondary"
          >
            {button}
          </Button>
        ))}
      </HCenterCol>
    )
  }

  return (
    <OSButtonRow buttonOrder={buttonOrder}>
      <Button
        variant="app-theme"
        onClick={() => onResponse?.(buttons[0]!)}
        className="min-w-23"
        size="lg"
        ripple={true}
      >
        {buttons[0]}
      </Button>

      {buttons.slice(1).map((button, bi) => (
        <Button
          key={bi}
          onClick={() => onResponse?.(button)}
          className="min-w-23"
          size="lg"
          variant="secondary"
        >
          {button}
        </Button>
      ))}
    </OSButtonRow>
  )
}
