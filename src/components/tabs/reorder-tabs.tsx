import {
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { IDivProps } from '@interfaces/div-props'
import { where } from '@lib/math/where'
import { truncate, type NullStr } from '@lib/text/text'
import { cva, type VariantProps } from 'class-variance-authority'
import { gsap } from 'gsap'
import { VCenterRow } from '../layout/v-center-row'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '../shadcn/ui/themed/context-menu'
import {
  SmallDragHandle,
  SortableItem,
  SortableItemContext,
} from '../sortable-item'
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
      sheet: 'py-1.5',
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

  // const itemsRef = useRef<Map<string, HTMLSpanElement>>(
  //   new Map<string, HTMLSpanElement>()
  // )

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
    const {
      attributes,
      isDragging,
      listeners,
      setNodeRef,
      //setActivatorNodeRef,
      transform,
      transition,
    } = useSortable({ id: tab.id })

    const dragStyle: CSSProperties = {
      opacity: isDragging ? 0.4 : undefined,
      transform: CSS.Translate.toString(transform),
      transition,
    }

    const labelRef = useRef<HTMLSpanElement>(null)
    const ref = useRef<HTMLButtonElement>(null)
    const lineRef = useRef<HTMLSpanElement>(null)
    const initial = useRef(true)

    const name = getTabName(tab)
    const truncatedName = truncate(name, {
      length: maxNameLength,
    })

    const [hover, setHover] = useState(false)

    useEffect(() => {
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

    // <VCenterRow
    //   id={tab.id}
    //   key={tab.id}
    //   data-checked={tab.id === active}
    //   className={tabVariants({
    //     variant,
    //     className: 'relative',
    //   })}
    //   aria-label={name}
    //   //role="tab"
    // >
    //   <SmallDragHandle
    //     className="cursor-ew-resize -mr-2"
    //     aria-label="Drag sheet to move"
    //   />

    let content: ReactNode = (
      <TabsTrigger
        ref={(el) => {
          ref.current = el
          setNodeRef(el)
        }}
        id={tab.id}
        variant="base"
        value={tab.id}
        key={tab.id}
        aria-label={name}
        className={tabButtonVariants({
          variant,
          className: 'flex flex-row items-center relative pr-4',
        })}
        style={{ ...dragStyle }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <SmallDragHandle
          className="cursor-ew-resize w-4"
          aria-label="Drag sheet to move"
        />
        <span
          ref={labelRef}
          data-checked={checked}
          aria-label={truncatedName}
          className={UNDERLINE_LABEL_CLS}
          // ref={(el) => {
          //   itemsRef.current.set(tab.id, el!)
          // }}
          title={name}
        >
          {truncatedName}
        </span>

        {/* {menuActions && menuActions.length > 0 && menuCallback && (
            <DropdownMenu
              open={show.get(tab.id) ?? false}
              onOpenChange={(v) => {
                setShow(
                  new Map<string, boolean>([...show.entries(), [tab.id, v]])
                )
              }}
            >
              <DropdownMenuTrigger
                className="absolute right-0"
                aria-label="Show menu"
              >
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
          )} */}

        {checked && (
          <span
            ref={lineRef}
            className="absolute bottom-0 w-full bg-theme h-0.5"
          />
        )}
      </TabsTrigger>
    )

    if (menuActions && menuActions.length > 0 && menuCallback) {
      content = (
        <ContextMenu>
          <ContextMenuTrigger asChild>{content}</ContextMenuTrigger>
          <ContextMenuContent>
            {/* <ContextMenuItem>Profile</ContextMenuItem>
            <ContextMenuItem>Billing</ContextMenuItem>
            <ContextMenuItem>Team</ContextMenuItem>
            <ContextMenuItem>Subscription</ContextMenuItem> */}

            {menuActions.map((menuAction, ai) => (
              <ContextMenuItem
                key={ai}
                onClick={() => menuCallback?.(tab, menuAction.action)}
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

    return (
      <SortableItemContext.Provider
        value={{ attributes, listeners, isDragging }}
      >
        {content}
      </SortableItemContext.Provider>
    )

    //   {menuActions && menuActions.length > 0 && menuCallback && (
    //     <DropdownMenu
    //       open={show.get(tab.id) ?? false}
    //       onOpenChange={(v) => {
    //         setShow(
    //           new Map<string, boolean>([...show.entries(), [tab.id, v]])
    //         )
    //       }}
    //     >
    //       <DropdownMenuTrigger className="mr-1" aria-label="Show menu">
    //         <ChevronRightIcon className="rotate-90" aria-label="Show menu" />
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="start">
    //         {menuActions.map((menuAction, ai) => (
    //           <DropdownMenuItem
    //             key={ai}
    //             onClick={() => menuCallback?.(tab, menuAction.action)}
    //             aria-label={menuAction.action}
    //           >
    //             {menuAction.icon && menuAction.icon}
    //             <span>{menuAction.action}</span>
    //           </DropdownMenuItem>
    //         ))}
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   )}

    //
    // </VCenterRow>
  }

  if (!selectedTab) {
    return null
  }

  const tabIds = tabs.map((tab) => tab.id)

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)} ref={ref}>
      <TabsList variant="base" className="relative text-xs" ref={tabListRef}>
        <DndContext
          modifiers={[restrictToHorizontalAxis]}
          onDragStart={(event) => setActiveId(event.active.id as string)}
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = where(tabs, (tab) => tab.id === active.id)[0]!
              const newIndex = where(tabs, (tab) => tab.id === over.id)[0]! //genesetState.order.indexOf(over.id as string)
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
            {/* <ul className="flex flex-row"> */}
            {tabs.map((tab) => {
              //const id = makeTabId(tab, ti)
              //const w = tab.size ?? defaultWidth
              const selected = tab.id === selectedTab.tab.id // tab.id === selectedTab?.tab.id

              return (
                <SortableItem as="div" key={tab.id} id={tab.id}>
                  <TabItem
                    tab={tab}
                    key={tab.id}
                    checked={selected}
                    active={activeId}
                  />
                </SortableItem>
              )
            })}
            {/* </ul> */}
          </SortableContext>

          <DragOverlay>
            {activeId ? (
              <TabItem
                tab={tabs.filter((tab) => tab.id === activeId)[0]!}
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
