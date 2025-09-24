import type { DraggableSyntheticListeners } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'

import { cn } from '@lib/shadcn-utils'
import { Minus } from 'lucide-react'
import type { CSSProperties } from 'react'
import { createContext, useContext } from 'react'
import { EllipsisIcon } from './icons/ellipsis-icon'
import { VerticalGripIcon } from './icons/vertical-grip-icon'
import { HCenterRow } from './layout/h-center-row'

interface Context {
  attributes: Record<string, any>
  listeners: DraggableSyntheticListeners
  ref(node: HTMLElement | null): void
  isDragging: boolean
}

export const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
  isDragging: false,
})

export function SortableItem({ id, className, style, children }: IDivProps) {
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

  return (
    <SortableItemContext.Provider
      value={{ ref: setNodeRef, attributes, listeners, isDragging }}
    >
      <li
        className={className}
        ref={setNodeRef}
        style={{ ...style, ...dragStyle }}
      >
        {children}
      </li>
    </SortableItemContext.Provider>
  )
}

export function DragHandle({ className, style, ...props }: IDivProps) {
  const { attributes, listeners } = useContext(SortableItemContext)

  return (
    <VCenterRow
      className="cursor-ns-resize group-data-[focus=true]:scale-125 group-hover:scale-125 transition-transform duration-200"
      {...listeners}
      {...attributes}
      {...props}
    >
      <VerticalGripIcon w="w-4.5 h-4.5" className={className} style={style} />
    </VCenterRow>
  )
}

export function SmallDragHandle({
  className = 'cursor-ns-resize',
  ...props
}: IDivProps) {
  const { attributes, listeners } = useContext(SortableItemContext)

  return (
    <VCenterRow className={className} {...listeners} {...attributes} {...props}>
      <Minus className="rotate-90 w-5 -ml-1 stroke-foreground/0 hover:stroke-foreground/50" />
    </VCenterRow>
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
