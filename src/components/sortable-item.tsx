import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'

import { cn } from '@lib/shadcn-utils'
import type {
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from 'react'
import { createContext, useContext } from 'react'
import { EllipsisIcon } from './icons/ellipsis-icon'
import { VerticalGripIcon } from './icons/vertical-grip-icon'
import { HCenterRow } from './layout/h-center-row'

interface Context {
  attributes: Record<string, any>
  listeners: DraggableSyntheticListeners
  //ref(node: HTMLElement | null | undefined): void
  isDragging: boolean
}

export const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  //ref: () => {},
  isDragging: false,
})

type SortableItemProps<T extends ElementType> = {
  as?: T
  children?: ReactNode
} & ComponentPropsWithoutRef<T>

export function SortableItem<T extends ElementType = 'li'>({
  id,
  as,
  className,
  style,
  children,
}: SortableItemProps<T>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    //setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: id! })

  const dragStyle: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  const Component = as || 'li'

  return (
    <SortableItemContext.Provider value={{ attributes, listeners, isDragging }}>
      <Component
        id={id}
        className={className}
        ref={setNodeRef}
        style={{ ...style, ...dragStyle }}
        //role="tab"
      >
        {children}
      </Component>
    </SortableItemContext.Provider>
  )
}

export const DRAG_HANDLE_APPEAR_CLS = `opacity-0 group-data-[focus=true]:opacity-50 group-hover:opacity-50 hover:opacity-100 focus-visible:opacity-100 trans-opacity`

export const DRAG_HANDLE_HOVER_ANIM_CLS = `scale-75 
  group-data-[focus=true]:scale-100 group-hover:scale-100 
  transition-transform 
  duration-200`

export function DragHandle({ className, style, ...props }: IDivProps) {
  const { attributes, listeners } = useContext(SortableItemContext)

  return (
    <VCenterRow
      className={cn('cursor-ns-resize', className)}
      {...listeners}
      {...attributes}
      {...props}
    >
      <VerticalGripIcon
        w="w-4.5 h-4.5"
        style={style}
        className={DRAG_HANDLE_HOVER_ANIM_CLS}
      />
    </VCenterRow>
  )
}

export function SmallDragHandle({
  className = 'cursor-ns-resize',
  ...props
}: IDivProps) {
  const { attributes, listeners } = useContext(SortableItemContext)

  return (
    <span
      className={cn(
        'inline-flex flex-row items-center justify-center trans-opacity hover:opacity-100 opacity-30',
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
  className = 'cursor-ew-resize',
  style,
  ...props
}: IDivProps) {
  const { attributes, listeners } = useContext(SortableItemContext)

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
