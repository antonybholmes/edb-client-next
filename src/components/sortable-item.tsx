import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'
import { EllipsisIcon } from './icons/ellipsis-icon'
import { VerticalGripIcon } from './icons/vertical-grip-icon'
import { HCenterRow } from './layout/h-center-row'

// Will make items fade in when hovering over a drag item
export const DRAG_HANDLE_APPEAR_CLS = `opacity-0 group-data-[focus=true]:opacity-50 
  group-hover:opacity-50 hover:opacity-100 focus-visible:opacity-100 trans-opacity`

export const DRAG_ICON_ANIM_CLS = `opacity-50 
  group-data-[focus=true]:opacity-100 
  group-data-[dragging=true]:opacity-100
  group-hover:opacity-100 
  trans-opacity`

// interface Context {
//   id: string
// }

// export const SortableItemContext = createContext<Context>({
//   id: '',
// })

type BaseSortableItemProps<T extends ElementType = 'li'> = {
  as?: T
  children?: ReactNode
  extChildren?: ReactNode
} & ComponentPropsWithoutRef<T>

export function BaseSortableItem<T extends ElementType = 'li'>({
  id,
  as,
  className,
  style,
  children,
}: BaseSortableItemProps<T>) {
  const { isDragging, setNodeRef, transform, transition } = useSortable({ id })

  const dragStyle: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const Component = as ?? 'li'

  return (
    // <SortableItemContext.Provider value={{ id }}>
    <Component
      id={id}
      className={cn('group relative', className)}
      ref={setNodeRef}
      style={{ ...style, ...dragStyle }}
      //role="tab"
    >
      {children}
    </Component>
    // </SortableItemContext.Provider>
  )
}

type SortableItemProps<T extends ElementType = 'li'> =
  BaseSortableItemProps<T> & {
    //we can optionally pass a custom drag handle instead of the default one rendered inside SortableItem
    dragHandle?: ReactNode
    innerCls?: string
  }

export function SortableItem<T extends ElementType = 'li'>({
  as,
  id,
  dragHandle,
  innerCls,
  className,
  children,
  extChildren,
}: SortableItemProps<T>) {
  return (
    <BaseSortableItem
      as={as ?? 'li'}
      id={id}
      className={cn(
        'flex flex-row items-center gap-x-2 grow min-w-0',
        className
      )}
      style={{ minWidth: 0 }}
    >
      <VCenterRow
        className={cn(
          'gap-x-1.5 pl-1.5 pr-1.5 py-1 h-full hover:bg-muted/30 grow rounded-theme min-h-10',
          innerCls
        )}
      >
        {dragHandle ? dragHandle : <DragHandle id={id} />}
        {children}
      </VCenterRow>
      {extChildren}
    </BaseSortableItem>
  )
}

export function DragHandle({
  id,
  className,

  style,
  ...props
}: IClassProps & { id: string }) {
  //const { id } = useContext(SortableItemContext)
  const { attributes, listeners, isDragging } = useSortable({ id })

  return (
    <VCenterRow
      className={cn('group cursor-ns-resize w-4.5 justify-center', className)}
      data-dragging={isDragging}
      {...listeners}
      {...attributes}
      {...props}
    >
      <VerticalGripIcon w={16} style={style} className={DRAG_ICON_ANIM_CLS} />
    </VCenterRow>
  )
}

export function SmallDragHandle({
  id,
  className = 'cursor-ns-resize',
  ...props
}: IDivProps & { id: string }) {
  //const { id } = useContext(SortableItemContext)
  const { attributes, listeners } = useSortable({ id })

  return (
    <span
      className={cn(
        'inline-flex flex-row items-center justify-center',
        className
      )}
      {...listeners}
      {...attributes}
      {...props}
    >
      <EllipsisIcon className="rotate-90" />
    </span>
  )
}

export function HDragHandle({
  id,
  className = 'cursor-ew-resize',
  style,
  ...props
}: IDivProps & { id: string }) {
  //const { id } = useContext(SortableItemContext)
  const { attributes, listeners } = useSortable({ id })

  return (
    <HCenterRow
      className="h-2 relative w-full"
      {...listeners}
      {...attributes}
      {...props}
    >
      <EllipsisIcon
        className={cn('absolute -translate-y-1/2 top-1/2', className)}
        style={style}
      />
    </HCenterRow>
  )
}
