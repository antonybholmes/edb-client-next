import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { useSortable } from '@dnd-kit/react/sortable'

import type { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { CollisionPriority } from '@dnd-kit/abstract'
import {
  RestrictToHorizontalAxis,
  RestrictToVerticalAxis,
} from '@dnd-kit/abstract/modifiers'
import { Ellipsis, EllipsisVertical } from 'lucide-react'
import { ComponentProps, type ElementType, type ReactNode } from 'react'
import { VerticalGripIcon } from './icons/vertical-grip-icon'
import { HCenterRow } from './layout/h-center-row'

// Will make items fade in when hovering over a drag item
export const DRAG_HANDLE_APPEAR_CLS = `opacity-0 
  group-data-focus:opacity-100 
  group-hover:opacity-100
  hover:opacity-100
  data-hover:opacity-100 
  focus-visible:opacity-100 
  trans-opacity`

export const DRAG_ICON_ANIM_CLS = `opacity-50 
  group-data-focus:opacity-100 
  group-data-dragging:opacity-100
  group-hover:opacity-100
  data-hover:opacity-100
  group-data-hover:opacity-100
  trans-opacity`

// interface Context {
//   id: string
// }

// export const SortableItemContext = createContext<Context>({
//   id: '',
// })

type BaseSortableItemProps<T extends ElementType = 'li'> = {
  as?: T
  type?: string | undefined
  group?: string | undefined
  accept?: string | string[] | undefined
  orientation?: 'vertical' | 'horizontal'
  children?: ReactNode
  extChildren?: ReactNode
} & ComponentProps<T>

export function BaseSortableItem<T extends ElementType = 'li'>({
  id,
  index,
  as,
  className,
  style,
  children,
  type,
  group,
  accept,
  orientation = 'vertical',
  ...props
}: BaseSortableItemProps<T>) {
  const { isDragging, ref } = useSortable({
    id,
    index,
    type,
    group,
    accept,
    modifiers: [
      orientation === 'vertical'
        ? RestrictToVerticalAxis
        : RestrictToHorizontalAxis,
    ],
    collisionPriority: CollisionPriority.Low,
  })

  // const dragStyle: CSSProperties = {
  //   opacity: isDragging ? 0.4 : undefined,
  //   transform: CSS.Translate.toString(transform),
  //   transition,
  // }

  const Component = as ?? 'li'

  return (
    <Component
      id={id}
      className={cn('relative', className)}
      ref={ref}
      {...props}
    >
      {children}
    </Component>
  )
}

type SortableItemProps<T extends ElementType = 'li'> =
  BaseSortableItemProps<T> & {
    index: number
    //we can optionally pass a custom drag handle instead of the default one rendered inside SortableItem
    dragHandle?: ReactNode
    innerCls?: string
  }

export function SortableItem<T extends ElementType = 'li'>({
  as,
  id,
  index,
  dragHandle,
  innerCls,
  type,
  group,
  accept,
  orientation,
  className,
  children,
  extChildren,
}: SortableItemProps<T>) {
  const dragCls = dragHandle ? 'hidden' : 'flex'
  return (
    <BaseSortableItem
      as={as ?? 'li'}
      id={id}
      className={cn(
        'flex flex-row items-center gap-x-1.5 grow min-w-0',
        className
      )}
      index={index}
      type={type}
      group={group}
      accept={accept}
      orientation={orientation}
      style={{ minWidth: 0 }}
    >
      <VCenterRow
        className={cn(
          'gap-x-1 pl-1 pr-1.5 py-1 h-full hover:bg-muted/30 grow rounded-theme min-h-10',
          innerCls
        )}
      >
        {/* Hide the drag handle if a custom one is passed, to avoid confusion. 
          The custom one is for things like a checkbox if we want to select items and momentarily turn off dragging */}
        <DragHandle id={id} index={index} className={dragCls} />
        {dragHandle && dragHandle}
        {children}
      </VCenterRow>
      {extChildren}
    </BaseSortableItem>
  )
}

export function DragHandle({
  id,
  index,
  className,

  style,
  ...props
}: IClassProps & { id: string; index: number }) {
  const { ref, isDragging } = useSortable({
    id,

    index,
    modifiers: [RestrictToVerticalAxis],
  })

  return (
    <VCenterRow
      ref={ref}
      className={cn('group cursor-ns-resize w-4 justify-start', className)}
      data-dragging={isDragging}

      {...props}
    >
      <VerticalGripIcon
        size={16}
        style={style}
        className={DRAG_ICON_ANIM_CLS}
      />
    </VCenterRow>
  )
}

export function SmallDragHandle({
  id,
  index,
  className,
  ...props
}: IClassProps & { id: string; index: number }) {
  //const { id } = useContext(SortableItemContext)
  const { ref } = useSortable({ id, index })

  return (
    <VCenterRow
      ref={ref}
      className={cn('justify-center overflow-hidden', className)}
    >
      <EllipsisVertical size={16} className="shrink-0 pointer-events-none" />
    </VCenterRow>
  )
}

export function HDragHandle({
  id,
  index,
  className = 'cursor-ew-resize',
  style,
  ...props
}: IDivProps & { id: string; index: number }) {
  //const { id } = useContext(SortableItemContext)
  const { ref } = useSortable({ id, index })

  return (
    <HCenterRow className="h-2 relative w-full" ref={ref}>
      <Ellipsis
        className={cn('absolute -translate-y-1/2 top-1/2', className)}
        style={style}
      />
    </HCenterRow>
  )
}
