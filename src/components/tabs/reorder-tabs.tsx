import { useMemo, useRef, useState } from 'react'

import { TabsList, TabsTrigger } from '../shadcn/ui/themed/tabs'

import { cn } from '@lib/shadcn-utils'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from './tab-provider'

import { DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from '@dnd-kit/sortable'
import type { IDivProps } from '@interfaces/div-props'
import { where } from '@lib/math/where'
import { truncate, type NullStr } from '@lib/text/text'
import { cva, type VariantProps } from 'class-variance-authority'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { VCenterRow } from '../layout/v-center-row'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/dropdown-menu'
import { SmallDragHandle, SortableItem } from '../sortable-item'
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

export const tabButtonVariants = cva('', {
  variants: {
    variant: {
      default: 'px-2 py-1',
      sheet: 'py-2 pl-2 pr-1',
      tab: 'border',
    },
  },
})

export interface ITabReorder {
  onReorder?: (order: string[]) => void
}

interface IProps
  extends ITabProvider,
    IDivProps,
    VariantProps<typeof tabVariants>,
    ITabMenu,
    ITabReorder {
  buttonClassName?: string
  maxNameLength?: number
}

export function ReorderTabs({
  ref,
  value,
  tabs,
  maxNameLength = -1,
  variant = 'default',
  className,
  menuCallback = () => {},
  menuActions = [],
  onReorder = () => {},
  children,
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)

  const itemsRef = useRef<Map<string, HTMLSpanElement>>(
    new Map<string, HTMLSpanElement>()
  )

  const [activeId, setActiveId] = useState<string | null>(null)

  const [show, setShow] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  //const { setTabIndicatorPos } = useContext(TabIndicatorContext)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  function TabItem({
    tab,
    checked,
    active = null,
  }: {
    tab: ITab
    checked: boolean
    active?: NullStr
  }) {
    //const { attributes, listeners } = useContext(SortableItemContext)

    const name = getTabName(tab)
    const truncatedName = truncate(name, {
      length: maxNameLength,
    })

    return (
      <>
        <VCenterRow
          id={tab.id}
          key={tab.id}
          data-checked={tab.id === active}
          className={tabVariants({
            variant,
            className: 'relative',
          })}
          aria-label={name}
        >
          <SmallDragHandle
            className="cursor-ew-resize -mr-2"
            aria-label="Drag sheet to move"
          />

          <TabsTrigger
            id={tab.id}
            variant="base"
            value={tab.id}
            key={tab.id}
            aria-label={name}
            className={tabButtonVariants({ variant })}
          >
            <span
              data-checked={checked}
              aria-label={truncatedName}
              className={UNDERLINE_LABEL_CLS}
              ref={el => {
                itemsRef.current.set(tab.id, el!)
              }}
              title={name}
            >
              {truncatedName}
            </span>
          </TabsTrigger>

          {menuActions && menuActions.length > 0 && menuCallback && (
            <DropdownMenu
              open={show.get(tab.id) ?? false}
              onOpenChange={v => {
                setShow(
                  new Map<string, boolean>([...show.entries(), [tab.id, v]])
                )
              }}
            >
              <DropdownMenuTrigger className="mr-1" aria-label="Show menu">
                <ChevronRightIcon
                  className="rotate-90"
                  aria-label="Show menu"
                />
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

          {checked && (
            <span className="absolute bottom-0 w-full left-0 bg-theme h-0.5" />
          )}
        </VCenterRow>
      </>
    )
  }

  if (!selectedTab) {
    return null
  }

  const tabIds = tabs.map(tab => tab.id)

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)} ref={ref}>
      <TabsList variant="base" className="relative text-xs" ref={tabListRef}>
        <DndContext
          modifiers={[restrictToHorizontalAxis]}
          onDragStart={event => setActiveId(event.active.id as string)}
          onDragEnd={event => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = where(tabs, tab => tab.id === active.id)[0]!
              const newIndex = where(tabs, tab => tab.id === over.id)[0]! //genesetState.order.indexOf(over.id as string)
              const newOrder = arrayMove(tabIds, oldIndex, newIndex)

              onReorder?.(newOrder)
            }

            setActiveId(null)
          }}
        >
          <SortableContext
            items={tabIds}
            strategy={horizontalListSortingStrategy}
          >
            <ul className="flex flex-row">
              {tabs.map(tab => {
                //const id = makeTabId(tab, ti)
                //const w = tab.size ?? defaultWidth
                const selected = tab.id === selectedTab.tab.id // tab.id === selectedTab?.tab.id

                return (
                  <SortableItem key={tab.id} id={tab.id}>
                    <TabItem
                      tab={tab}
                      key={tab.id}
                      checked={selected}
                      active={activeId}
                    />
                  </SortableItem>
                )
              })}
            </ul>
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <TabItem
                tab={tabs.filter(tab => tab.id === activeId)[0]!}
                checked={true}
                active={activeId}
              />
            ) : null}
          </DragOverlay>
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
      </TabsList>
      {children && children}
    </VCenterRow>
  )
}
