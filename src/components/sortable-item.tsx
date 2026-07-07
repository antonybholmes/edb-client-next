import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { Ellipsis, EllipsisVertical } from 'lucide-react'
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'
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
  const dragCls = dragHandle ? 'hidden' : 'flex'
  return (
    <BaseSortableItem
      as={as ?? 'li'}
      id={id}
      className={cn(
        'flex flex-row items-center gap-x-1.5 grow min-w-0',
        className
      )}
      style={{ minWidth: 0 }}
    >
      <VCenterRow
        className={cn(
          'gap-x-2 pl-1 pr-1.5 py-1 h-full hover:bg-muted/30 grow rounded-theme min-h-10',
          innerCls
        )}
      >
        {/* Hide the drag handle if a custom one is passed, to avoid confusion. 
          The custom one is for things like a checkbox if we want to select items and momentarily turn off dragging */}
        <DragHandle id={id} className={dragCls} />
        {dragHandle && dragHandle}
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
      className={cn('group cursor-ns-resize w-4 justify-start', className)}
      data-dragging={isDragging}
      {...listeners}
      {...attributes}
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
  className,
  ...props
}: IClassProps & { id: string }) {
  //const { id } = useContext(SortableItemContext)
  const { attributes, listeners } = useSortable({ id })

  return (
    <VCenterRow
      className={cn('justify-center overflow-hidden', className)}
      {...listeners}
      {...attributes}
      {...props}
    >
      <EllipsisVertical size={16} className="shrink-0 pointer-events-none" />
    </VCenterRow>
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
      <Ellipsis
        className={cn('absolute -translate-y-1/2 top-1/2', className)}
        style={style}
      />
    </HCenterRow>
  )
}
