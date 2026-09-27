import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { cn } from '@/lib/shadcn-utils'
import type { ComponentProps } from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

const THIN_LINE_HANDLE_CLS = cn(
  'trans-color bg-border/50 group-data-auto-hide:bg-transparent z-0',
  'group-data-[separator=hover]:bg-transparent',
  'group-data-[separator=active]:bg-transparent',
  'pointer-events-none'
)

const THIN_LINE_HANDLE2_CLS = cn(
  'absolute z-10',
  'trans-color rounded-full bg-transparent',
  'group-data-[separator=hover]:bg-app-theme/40',
  'group-data-[separator=active]:bg-app-theme/40',
  'pointer-events-none'
)

const THIN_H_RESIZE_HANDLE_CLS = cn(
  'group flex shrink-0 grow-0 cursor-ew-resize flex-row',
  'items-center justify-center outline-hidden relative'
)

const THIN_H_LINE_HANDLE_CLS = cn(THIN_LINE_HANDLE_CLS, 'h-full w-px')

const THIN_H_LINE_HANDLE2_CLS = cn(
  THIN_LINE_HANDLE2_CLS,
  'top-0 left-1/2 -translate-x-1/2 h-full w-[4px]'
)

const THIN_V_RESIZE_HANDLE_CLS = cn(
  'group flex shrink-0 grow-0 flex-row items-center',
  'justify-center outline-hidden group relative cursor-ns-resize'
)

const THIN_V_LINE_HANDLE_CLS = cn(THIN_LINE_HANDLE_CLS, 'w-full h-px')

const THIN_V_LINE_HANDLE2_CLS = cn(
  THIN_LINE_HANDLE2_CLS,
  'left-0 top-1/2 -translate-y-1/2 w-full h-[4px]'
)

export const INNER_HANDLE_CLS = cn(
  'grow items-center justify-center rounded-full bg-ring trans-opacity pointer-events-none',
  'flex flex-col group-data-[drag-dir=vertical]:h-1 group-data-[drag-dir=horizontal]:w-1',
  'group-data-[panel-group-direction=horizontal]:w-1 group-data-[panel-group-direction=vertical]:h-1',
  'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
  'group-data-[resize-handle-state=hover]:opacity-100 group-data-[resize-handle-state=drag]:opacity-100'
)

export const HANDLE_CLS = cn(
  'group shrink-0 grow-0 justify-center items-center outline-hidden overflow-hidden relative',
  //'flex data-[drag-dir=horizontal]:flex-col data-[drag-dir=vertical]:flex-row',
  'flex flex-col data-[drag-dir=horizontal]:w-[16px] data-[drag-dir=vertical]:h-[16px]',
  'data-[panel-group-direction=horizontal]:w-[16px] data-[panel-group-direction=vertical]:h-[16px]',
  'data-[drag-dir=horizontal]:cursor-ew-resize data-[drag-dir=vertical]:cursor-ns-resize'
)

export const ResizablePanelGroup = ({
  className,
  ...props
}: ComponentProps<typeof ResizablePrimitive.Group>) => (
  <ResizablePrimitive.Group className={className} {...props} />
)

export const ResizablePanel = ResizablePrimitive.Panel

interface IResizeHandleProps extends ComponentProps<
  typeof ResizablePrimitive.Separator
> {
  w?: number
  autoHide?: boolean
}

export function ThinHResizeHandle({
  id,
  w = 1,
  autoHide = true,
  ...props
}: IResizeHandleProps) {
  return (
    <ResizablePrimitive.Separator
      data-auto-hide={autoHide ? true : undefined}
      className={THIN_H_RESIZE_HANDLE_CLS}
      style={{ width: `${w}rem` }}
      {...props}
    >
      <span className={THIN_H_LINE_HANDLE_CLS} />
      <span className={THIN_H_LINE_HANDLE2_CLS} />
    </ResizablePrimitive.Separator>
  )
}

export function ThinVResizeHandle({
  id,
  autoHide = true,
  w = 1,
  ...props
}: IResizeHandleProps) {
  return (
    <ResizablePrimitive.Separator
      data-auto-hide={autoHide ? true : undefined}
      className={THIN_V_RESIZE_HANDLE_CLS}
      style={{ height: `${w}rem` }}
      {...props}
    >
      <span className={THIN_V_LINE_HANDLE_CLS} />
      <span className={THIN_V_LINE_HANDLE2_CLS} />
    </ResizablePrimitive.Separator>
  )
}

export function DragHandle() {
  return (
    <VCenterCol className="bg-white py-1 w-2.5 items-center rounded-full border border-ring group-data-[drag-dir=vertical]:rotate-90 z-10 ">
      <VerticalGripIcon stroke="stroke-ring" />
    </VCenterCol>
  )
}

export function InnerHandle({ withHandle = false }: { withHandle?: boolean }) {
  if (withHandle) {
    return (
      <div className={INNER_HANDLE_CLS}>{withHandle && <DragHandle />}</div>
    )
  } else {
    return <span className={INNER_HANDLE_CLS} />
  }
}
