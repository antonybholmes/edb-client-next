import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../../../shadcn/ui/themed/v2/tabs'

import { getTabName } from '../../../tabs/tab-provider'

import { useIsMounted } from '@/hooks/mounted'
import { IChildrenProps } from '@/interfaces/children-props'
import { truncate, type NullStr } from '@/lib/text/text'

import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { cva, type VariantProps } from 'class-variance-authority'
import { gsap } from 'gsap'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../../../shadcn/ui/themed/v2/context-menu'
import { BaseSortableItem, SmallDragHandle } from '../../../sortable-item'
import {
  UNDERLINE_LABEL_CLS,
  type ITabMenu,
} from '../../../tabs/underline-tabs'
import {
  useCurrentSheets,
  useFiles,
} from './history/history-provider/history-contexts'
import { useHistory } from './history/history-provider/history-provider'
import { DataFrameType } from './history/history-provider/history-types'

export const tabVariants = cva(
  'group trans-color trans-color flex flex-row items-center',
  {
    variants: {
      variant: {
        none: '',
        default:
          'rounded-theme overflow-hidden mb-1 focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted px-2 py-1',
        sheet:
          'focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted',
        tab: '',
      },
    },
  }
)

export const tabButtonVariants = cva('group', {
  variants: {
    variant: {
      none: '',
      default: 'px-2 py-1',
      sheet: 'py-1.5 trans-color',
      tab: 'border',
    },
  },
})

interface ITabSortableItemProps
  extends ITabMenu, VariantProps<typeof tabVariants> {
  index: number
  sheet: DataFrameType
  checked: boolean
  active?: NullStr
  allowReorder?: boolean
}

function SheetItem({
  index,
  sheet,
  checked,
  allowReorder,
  menuActions,
  menuCallback,
  variant,
}: ITabSortableItemProps) {
  const ref = useRef<HTMLElement | null>(null)

  const {
    isDragging,
    //ref,
    //setActivatorNodeRef,
    //transform,
    //transition,
  } = useSortable({ id: sheet.id, index, handle: ref })

  const labelRef = useRef<HTMLSpanElement>(null)

  const lineRef = useRef<HTMLSpanElement>(null)
  const initial = useRef(true)

  //const name = getTabName(tab)
  // const truncatedName = truncate(name, {
  //   length: maxNameLength,
  // })

  const name = getTabName(sheet)

  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!lineRef.current) {
      return
    }

    const w1 = labelRef.current?.offsetWidth ?? 1
    const w2 = ref.current?.offsetWidth ?? 2
    const p = w1 / w2
    const duration = initial.current ? 0 : 0.5

    gsap.timeline().to(
      lineRef.current,
      {
        scaleX: hover ? 1 : p,
        opacity: hover ? 1 : 0.8,
        duration,
        transformOrigin: 'center center',
        ease: 'power3.out',
      },
      0
    )

    initial.current = false
  }, [ref.current, labelRef.current, hover])

  const label = truncate(name, { length: 16 })

  let content: ReactNode = (
    <BaseSortableItem as="div" key={sheet.id} id={sheet.id}>
      <TabsTrigger
        ref={ref}
        id={sheet.id}
        value={sheet.id}
        key={sheet.id}
        aria-label={name}
        className={tabButtonVariants({
          variant,
          className: 'flex flex-row items-center relative pr-4',
        })}
        variant="base"

        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SmallDragHandle
          index={index}
          id={sheet.id}
          className="w-4 h-6 cursor-ew-resize opacity-0 group-hover:opacity-100 trans-opacity"
          aria-label="Drag sheet to move"
        />
        <span
          ref={labelRef}
          data-checked={checked}
          aria-label={label}
          className={UNDERLINE_LABEL_CLS}
          // ref={(el) => {
          //   itemsRef.current.set(sheet.id, el!)
          // }}
          title={name}
        >
          {label}
        </span>
      </TabsTrigger>
      {checked && (
        <span
          ref={lineRef}
          className="absolute bottom-0 w-full bg-app-theme h-0.5"
        />
      )}
    </BaseSortableItem>
  )

  if (menuActions && menuActions.length > 0 && menuCallback) {
    content = (
      <ContextMenu>
        <ContextMenuTrigger render={content} />
        <ContextMenuContent>
          {menuActions.map((menuAction, ai) => (
            <ContextMenuItem
              key={ai}
              onClick={() => menuCallback?.(sheet, menuAction.action)}
              aria-label={menuAction.action}
            >
              {menuAction.icon && menuAction.icon}
              <span>{menuAction.action}</span>
            </ContextMenuItem>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  return content
}

export interface ITabReorder {
  onReorder?: (order: string[]) => void
}

interface IProps
  extends IChildrenProps, VariantProps<typeof tabVariants>, ITabMenu {
  buttonClassName?: string
  maxNameLength?: number
  allowReorder?: boolean
}

export function ReorderTabs({
  variant,
  menuCallback = () => {},
  menuActions = [],
  allowReorder = true,
}: IProps) {
  const { goto, reorderSheets } = useHistory()
  const { file } = useFiles()

  const { sheet, sheets } = useCurrentSheets()

  const tabListRef = useRef<HTMLDivElement>(null)

  const [activeId, setActiveId] = useState<string | null>(null)

  const tabIds = sheets.map((sheet) => sheet.id)

  // stops nextjs complaint about hydration mismatch due to dnd kit using document in useSortable
  const isMounted = useIsMounted()

  if (!isMounted) {
    return null
  }

  return (
    <DragDropProvider
      //modifiers={[restrictToHorizontalAxis]}
      onDragStart={(event) => setActiveId(event.operation.source.id as string)}
      onDragEnd={(event) => {
        //const { active, over } = event

        if (allowReorder) {
          const newOrder = move(tabIds, event)

          //const oldIndex = tabIds.indexOf(active.id as string) //where(tabs ?? [], tab => tab.id === (active.id as string))[0]!
          //const newIndex = tabIds.indexOf(over.id as string) //where(tabs ?? [], (tab) => tab.id === over.id)[0]! //genesetState.order.indexOf(over.id as string)
          //const newOrder = arrayMove(tabIds, oldIndex, newIndex)

          // const orderMap = Object.fromEntries(
          //   newOrder.map((id, i) => [id, i])
          // )

          // sort based on new order
          // const newSheets = sheets.slice().sort((a, b) => {
          //   const aOrder = orderMap[a.id] ?? 0
          //   const bOrder = orderMap[b.id] ?? 0

          //   return aOrder - bOrder
          // })

          reorderSheets(newOrder)
        }

        setActiveId(null)
      }}
    >
      <Tabs
        value={sheet?.id ?? ''}
        onValueChange={(id) => {
          goto({ file, sheet: id })
        }}
        className="overflow-hidden grow"
      >
        <TabsList className="text-xs overflow-hidden" ref={tabListRef}>
          {sheets.map((s, si) => {
            const selected = s.id === sheet?.id

            return (
              <SheetItem
                index={si}
                sheet={s}
                key={s.id}
                checked={selected}
                active={activeId}
                variant={variant}
                allowReorder={allowReorder}
                menuActions={menuActions}
                menuCallback={menuCallback}
              />
            )
          })}

          {/* <DragOverlay>
              {activeId ? (
                <TabItem
                  tab={tabs.filter((tab) => tab.id === activeId)[0]!}
                  checked={true}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
        </TabsList>
      </Tabs>
    </DragDropProvider>
  )
}
