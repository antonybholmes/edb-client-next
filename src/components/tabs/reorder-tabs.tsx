import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { cn } from '@/lib/shadcn-utils'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from './tab-provider'

import type { IDivProps } from '@/interfaces/div-props'
import { where } from '@/lib/math/where'
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
import { VCenterRow } from '../layout/v-center-row'
import { BaseSortableItem, SmallDragHandle } from '../sortable-item'
import { UNDERLINE_LABEL_CLS, type ITabMenu } from './underline-tabs'

export const tabVariants = cva(
  'group trans-color trans-color flex flex-row items-center',
  {
    variants: {
      variant: {
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
      default: 'px-2 py-1',
      sheet: 'py-1.5 hover:bg-muted/50 trans-color',
      tab: 'border',
    },
  },
})

interface ITabSortableItemProps
  extends ITabMenu, VariantProps<typeof tabVariants> {
  tab: ITab
  checked: boolean
  active?: NullStr
  allowReorder?: boolean
}

function TabItem({
  tab,
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
  } = useSortable({ id: tab.id })

  const labelRef = useRef<HTMLSpanElement>(null)
  const ref = useRef<HTMLElement | null>(null)
  const lineRef = useRef<HTMLSpanElement>(null)
  const initial = useRef(true)

  const name = getTabName(tab)
  // const truncatedName = truncate(name, {
  //   length: maxNameLength,
  // })

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
    <BaseSortableItem as="div" key={tab.id} id={tab.id}>
      <TabsTrigger
        ref={(el) => {
          ref.current = el as HTMLButtonElement
          setNodeRef(el as HTMLButtonElement)
        }}
        id={tab.id}
        variant="base"
        value={tab.id}
        key={tab.id}
        aria-label={name}
        className={tabButtonVariants({
          variant,
          className: 'flex flex-row items-center relative',
        })}
        style={{ paddingRight: allowReorder ? '1rem' : '0.5rem' }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SmallDragHandle
          id={tab.id}
          className="cursor-ew-resize w-4 opacity-0 group-hover:opacity-100 trans-opacity"
          aria-label="Drag sheet to move"
        />
        <span
          ref={labelRef}
          data-checked={checked}
          aria-label={name}
          className={UNDERLINE_LABEL_CLS}
          // ref={(el) => {
          //   itemsRef.current.set(tab.id, el!)
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

  // if (menuActions && menuActions.length > 0 && menuCallback) {
  //   content = (
  //     <ContextMenu>
  //       <ContextMenuTrigger render={content} />
  //       <ContextMenuContent>
  //         {menuActions.map((menuAction, ai) => (
  //           <ContextMenuItem
  //             key={ai}
  //             onClick={() => menuCallback?.(tab, menuAction.action)}
  //             aria-label={menuAction.action}
  //           >
  //             {menuAction.icon && menuAction.icon}
  //             <span>{menuAction.action}</span>
  //           </ContextMenuItem>
  //         ))}
  //       </ContextMenuContent>
  //     </ContextMenu>
  //   )
  // }

  return content
}

export interface ITabReorder {
  onReorder?: (order: string[]) => void
}

interface IProps
  extends
    ITabProvider,
    IDivProps,
    VariantProps<typeof tabVariants>,
    ITabMenu,
    ITabReorder {
  buttonClassName?: string
  maxNameLength?: number
  allowReorder?: boolean
}

export function ReorderTabs({
  ref,
  value,
  tabs,
  variant = 'default',
  className,
  menuCallback = () => {},
  menuActions = [],
  onReorder = () => {},
  allowReorder = true,
  children,
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)

  // const itemsRef = useRef<Map<string, HTMLSpanElement>>(
  //   new Map<string, HTMLSpanElement>()
  // )

  const [activeId, setActiveId] = useState<string | null>(null)

  //const { setTabIndicatorPos } = useContext(TabIndicatorContext)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  if (!selectedTab) {
    return null
  }

  const tabIds = tabs.map((tab) => tab.id)

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)} ref={ref}>
      <DndContext
        modifiers={[restrictToHorizontalAxis]}
        onDragStart={(event) => setActiveId(event.active.id as string)}
        onDragEnd={(event) => {
          const { active, over } = event

          if (allowReorder && over && active.id !== over?.id) {
            const oldIndex = where(tabs, (tab) => tab.id === active.id)[0]!
            const newIndex = where(tabs, (tab) => tab.id === over.id)[0]! //genesetState.order.indexOf(over.id as string)
            const newOrder = arrayMove(tabIds, oldIndex, newIndex)

            onReorder?.(newOrder)
          }

          setActiveId(null)
        }}
      >
        <TabsList className="text-xs" ref={tabListRef}>
          <SortableContext
            items={tabIds}
            strategy={horizontalListSortingStrategy}
          >
            {tabs.map((tab) => {
              const selected = tab.id === selectedTab.tab.id

              return (
                <TabItem
                  tab={tab}
                  key={tab.id}
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
