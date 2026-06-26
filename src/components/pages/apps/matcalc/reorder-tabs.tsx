import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../../../shadcn/ui/themed/v2/tabs'

import { cn } from '@/lib/shadcn-utils'
import { getTabName } from '../../../tabs/tab-provider'

import { useIsMounted } from '@/hooks/mounted'
import { IChildrenProps } from '@/interfaces/children-props'
import { type NullStr } from '@/lib/text/text'
import { DndContext } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { cva, type VariantProps } from 'class-variance-authority'
import { gsap } from 'gsap'
import { VCenterRow } from '../../../layout/v-center-row'
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
  sheet: DataFrameType
  checked: boolean
  active?: NullStr
  allowReorder?: boolean
}

function SheetItem({
  sheet,
  checked,
  allowReorder,
  menuActions,
  menuCallback,
  variant,
}: ITabSortableItemProps) {
  const {
    isDragging,
    setNodeRef,
    //setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: sheet.id })

  const labelRef = useRef<HTMLSpanElement>(null)
  const ref = useRef<HTMLElement | null>(null)
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

  let content: ReactNode = (
    <BaseSortableItem as="div" key={sheet.id} id={sheet.id}>
      <TabsTrigger
        ref={(el) => {
          ref.current = el as HTMLButtonElement
          setNodeRef(el as HTMLButtonElement)
        }}
        id={sheet.id}
        value={sheet.id}
        key={sheet.id}
        aria-label={name}
        className={tabButtonVariants({
          variant,
          className: 'flex flex-row items-center relative',
        })}
        variant="base"
        style={{ paddingRight: allowReorder ? '1rem' : '0.5rem' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SmallDragHandle
          id={sheet.id}
          className="cursor-ew-resize w-4 opacity-0 group-hover:opacity-100 trans-opacity"
          aria-label="Drag sheet to move"
        />
        <span
          ref={labelRef}
          data-checked={checked}
          aria-label={name}
          className={UNDERLINE_LABEL_CLS}
          // ref={(el) => {
          //   itemsRef.current.set(sheet.id, el!)
          // }}
          title={name}
        >
          {name}
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
  className,
  menuCallback = () => {},
  menuActions = [],

  allowReorder = true,
  children,
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
    <VCenterRow className={cn('justify-between gap-x-1', className)}>
      <DndContext
        modifiers={[restrictToHorizontalAxis]}
        onDragStart={(event) => setActiveId(event.active.id as string)}
        onDragEnd={(event) => {
          const { active, over } = event

          if (allowReorder && over && active.id !== over?.id) {
            const oldIndex = tabIds.indexOf(active.id as string) //where(tabs ?? [], tab => tab.id === (active.id as string))[0]!
            const newIndex = tabIds.indexOf(over.id as string) //where(tabs ?? [], (tab) => tab.id === over.id)[0]! //genesetState.order.indexOf(over.id as string)
            const newOrder = arrayMove(tabIds, oldIndex, newIndex)

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
        >
          <TabsList className="text-xs" ref={tabListRef}>
            <SortableContext
              items={tabIds}
              strategy={horizontalListSortingStrategy}
            >
              {sheets.map((s) => {
                const selected = s.id === sheet?.id

                return (
                  <SheetItem
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
            </SortableContext>
          </TabsList>
        </Tabs>
      </DndContext>

      {/* <Reorder.Group
          axis="x"
          values={tabs.map(tab => tab.id)}
          onReorder={onReorder}
          className="flex flex-row"
          ref={tabListRef}
        >
          {tabs.map(tab => {
            //const id = makeTabId(tab, ti)
            //const w = tab.size ?? defaultWidth
            const selected = tab.id === selectedTab.tab.id // tab.id === selectedTab?.tab.id

            const name = getTabName(tab)
            const truncatedName = truncate(name, {
              length: maxNameLength,
            })

            return (
              <Reorder.Item
                id={tab.id}
                key={tab.id}
                value={tab.id}
                className={tabVariants({
                  variant,
                  className: 'flex flex-row relative',
                })}
                aria-label={name}
                ref={el => {
                  buttonsRef.current.set(tab.id, el!)
                }}
              >
                <BaseTabsTrigger
                  id={tab.id}
                  value={tab.id}
                  key={tab.id}
                  aria-label={name}
                  className={tabButtonVariants({ variant })}
                >
                  <span
                    //data-checked={selected}
                    aria-label={truncatedName}
                    className={UNDERLINE_LABEL_CLS}
                    ref={el => {
                      itemsRef.current.set(tab.id, el!)
                    }}
                    title={name}
                  >
                    {truncatedName}
                  </span>
                </BaseTabsTrigger>

                {menuActions && menuActions.length > 0 && menuCallback && (
                  <DropdownMenu
                    open={show.get(tab.id) ?? false}
                    onOpenChange={v => {
                      setShow(
                        new Map<string, boolean>([
                          ...show.entries(),
                          [tab.id, v],
                        ])
                      )
                    }}
                  >
                    <DropdownMenuTrigger className="mr-1">
                      <ChevronRightIcon className="rotate-90" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {menuActions.map((menuAction, ai) => (
                        <DropdownMenuItem
                          key={ai}
                          onClick={() => menuCallback?.(tab, menuAction.action)}
                          aria-label={menuAction.action}
                        >
                          {menuAction.icon && menuAction.icon}
                          <span>{menuAction.action}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {selected && (
                  <span className="absolute bottom-0 w-full left-0 bg-theme h-0.5" />
                )}
              </Reorder.Item>
            )
          })}
        </Reorder.Group> */}

      {/* <TabIndicatorH /> */}

      {children && children}
    </VCenterRow>
  )
}
