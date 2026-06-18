import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterCol } from '@/components/layout/v-center-col'
import { cn } from '@/lib/shadcn-utils'
import type { ComponentProps } from 'react'
import * as ResizablePrimitive from 'react-resizable-panels'

// const LINE_V_RESIZE_HANDLE_CLS =
//   'group flex shrink-0 grow-0 flex-row items-center justify-center outline-hidden group'

const THIN_H_RESIZE_HANDLE_CLS =
  'group w-2 flex shrink-0 grow-0 cursor-ew-resize flex-row items-center justify-center outline-hidden relative'

const THIN_V_RESIZE_HANDLE_CLS =
  'group flex shrink-0 grow-0 flex-row items-center justify-center outline-hidden h-2 group relative cursor-ns-resize'

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

// export function LineVResizeHandle({
//   id,
//   ...props
// }: ComponentProps<typeof ResizablePrimitive.Separator>) {
//   const _id = id ?? useStableId('line-v-resize-handle')

//   return (
//     <ResizablePrimitive.Separator
//       id={_id}
//       className={LINE_V_RESIZE_HANDLE_CLS}
//       {...props}
//     >
//       <span className="trans-color w-full h-px bg-border group-data-[separator=hover]:bg-app-theme/50 group-data-[separator=active]:bg-app-theme/50" />
//     </ResizablePrimitive.Separator>
//   )
// }

// const THIN_V_LINE_HANDLE_CLS = cn(
//   'absolute left-0 right-0 top-1/2 -translate-y-1/2 trans-color rounded-full h-1 group-data-[separator=hover]:bg-ring group-data-[separator=active]:bg-ring'
// )

// export function ThinVLineHandle({
//   id,
//   autoHide = true,
//   ...props
// }: IResizeHandleProps) {
//   const _id = id ?? useStableId('thin-v-line-handle')

//   return (
//     <ResizablePrimitive.Separator
//       id={_id}
//       data-auto-hide={autoHide}
//       className={cn('w-full h-px group relative cursor-ns-resize', {
//         'bg-border/50 hover:bg-border/70': !autoHide,
//       })}
//       {...props}
//     >
//       {/* <span className="w-full h-px border-t border-transparent group-data-[auto-hide=false]:border-border/50 absolute left-0 top-1/2 -translate-y-1/2" /> */}
//       <span className={THIN_V_LINE_HANDLE_CLS} />
//     </ResizablePrimitive.Separator>
//   )
// }

interface IResizeHandleProps extends ComponentProps<
  typeof ResizablePrimitive.Separator
> {
  autoHide?: boolean
}

const THIN_H_LINE_HANDLE_CLS = cn(
  'h-full trans-color bg-transparent w-[2px] group-hover:bg-app-theme/40',
  'group-data-[separator=hover]:bg-app-theme/40 group-data-[separator=active]:bg-app-theme/40'
)

export function ThinHResizeHandle({
  id,
  autoHide = true,
  ...props
}: IResizeHandleProps) {
  //const _id = id ?? useStableId('thin-h-resize-handle')

  return (
    <ResizablePrimitive.Separator
      //id={_id}
      data-auto-hide={autoHide}
      className={THIN_H_RESIZE_HANDLE_CLS}
      {...props}
    >
      {/* <span className="h-full w-px border-l border-transparent group-data-[auto-hide=false]:border-border/50 absolute top-0 left-1/2 -translate-x-1/2" /> */}

      <span className={THIN_H_LINE_HANDLE_CLS} />
    </ResizablePrimitive.Separator>
  )
}

const THIN_V_LINE_HANDLE_CLS = cn(
  'trans-color  w-full h-[2px] bg-transparent group-hover:bg-app-theme/40',
  'group-data-[separator=hover]:bg-app-theme/40 group-data-[separator=active]:bg-app-theme/40'
)

export function ThinVResizeHandle({
  id,
  autoHide = true,
  ...props
}: IResizeHandleProps) {
  //const _id = id ?? useStableId('thin-v-resize-handle')

  return (
    <ResizablePrimitive.Separator
      // id={_id}
      data-auto-hide={autoHide}
      className={THIN_V_RESIZE_HANDLE_CLS}
      {...props}
    >
      {/* <span className="w-full h-px border-t border-transparent group-data-[auto-hide=false]:border-border/50 absolute left-0 top-1/2 -translate-y-1/2" /> */}
      <span className={THIN_V_LINE_HANDLE_CLS} />
    </ResizablePrimitive.Separator>
  )
}

// const ResizableHandle = ({
//   withHandle = false,
//   className,
//   ...props
// }: ComponentProps<typeof ResizablePrimitive.ResizablePrimitive.Separator> & {
//   withHandle?: boolean
// }) => (
//   <ResizablePrimitive.ResizablePrimitive.Separator
//     className={cn(HANDLE_CLS, className)}
//     {...props}
//   >
//     <InnerHandle withHandle={withHandle} />
//   </ResizablePrimitive.ResizablePrimitive.Separator>
// )

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
