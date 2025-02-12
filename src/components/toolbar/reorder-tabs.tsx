import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type RefObject,
} from 'react'

import type { IChildrenProps } from '@interfaces/children-props'
import { BaseTabsList, BaseTabsTrigger } from '../shadcn/ui/themed/tabs'

import { cn } from '@/lib/class-names'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from '../tab-provider'

import { truncate } from '@/lib/text/text'
import { type VariantProps } from 'class-variance-authority'
import { Reorder } from 'motion/react'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { VCenterRow } from '../layout/v-center-row'

import type { IClassProps } from '@/interfaces/class-props'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/dropdown-menu'
import {
  tabVariants,
  ToolbarTabLine,
  UNDERLINE_LABEL_CLS,
  type IMenuAction,
  type ITabMenu,
} from './underline-tabs'

export interface ITabPos {
  x: number
  width: number
  //transform?: string
}

function UnderlineTab({
  tab,
  selected,
  maxNameLength,
  variant,
  menuCallback,
  menuActions,
}: {
  tab: ITab
  selected: boolean
  maxNameLength: number
  menuCallback?: (tab: ITab, action: string) => void
  menuActions?: IMenuAction[]
  tabListRef: RefObject<HTMLDivElement | null>
} & VariantProps<typeof tabVariants> &
  IClassProps) {
  //const id = makeTabId(tab, ti)
  //const w = tab.size ?? defaultWidth
  const tabId = tab.id //getTabId(tab)
  const buttonsRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<HTMLSpanElement>(null)
  const [show, setShow] = useState(false)
  const [scale, setScale] = useState(0)

  const name = getTabName(tab)
  const truncatedName = truncate(name, {
    length: maxNameLength,
  })

  const [tabPos, setTabPos] = useState<ITabPos>({
    x: 0,
    width: 0,
    //transform: `scaleX(1)`,
  })

  useEffect(() => {
    //const x = tabUnderlineProps[tabId]!.x + (_scale === 1 ? padding : 0)
    //const width = tabUnderlineProps[tabId]!.w - (_scale === 1 ? 2 * padding : 0)

    //console.log(selectedTab.index)

    //const button = buttonsRef.current[selectedTab.index]!

    //const buttonRect = button.getBoundingClientRect()
    const containerRect = buttonsRef.current!.getBoundingClientRect()

    const clientRect =
      scale > 1 || show
        ? buttonsRef.current!.getBoundingClientRect()
        : itemsRef.current!.getBoundingClientRect()

    // setTabPos({
    //   x: `${x}rem`,
    //   width: `${width}rem`,
    // })

    setTabPos({
      x: clientRect.left - containerRect.left,
      width: clientRect.width,
      //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    })

    // currentTab.current = tabUnderlineProps[tabId].x
    // initial.current = false
  }, [scale])

  return (
    <Reorder.Item
      key={tab.id}
      value={tab.id}
      onMouseEnter={() => {
        if (selected) {
          setScale(2)
        }
      }}
      onMouseLeave={() => {
        if (selected) {
          setScale(1)
        }
      }}
      onMouseDown={() => {
        setScale(2)
      }}
      className={tabVariants({ variant, className: ' flex flex-row relative' })}
      aria-label={name}
      //aria-label={truncatedName}
      data-selected={show}
      ref={buttonsRef}
    >
      <BaseTabsTrigger
        value={tabId}
        key={tabId}
        aria-label={name}
        className="px-2"
      >
        <span
          data-selected={selected}
          aria-label={truncatedName}
          className={UNDERLINE_LABEL_CLS}
          ref={itemsRef}
          title={name}
        >
          {truncatedName}
        </span>
      </BaseTabsTrigger>

      {menuActions && menuActions.length > 0 && menuCallback && (
        <DropdownMenu open={show} onOpenChange={setShow}>
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

      {selected && <ToolbarTabLine tabPos={tabPos} />}
    </Reorder.Item>
  )
}

export interface ITabReorder {
  onReorder?: (order: string[]) => void
}

interface IProps
  extends ITabProvider,
    IChildrenProps,
    VariantProps<typeof tabVariants>,
    ITabMenu,
    ITabReorder {
  buttonClassName?: string
  maxNameLength?: number
}

export const ReorderTabs = forwardRef(function ReorderTabs(
  {
    value,
    tabs,
    maxNameLength = -1,
    variant = 'default',
    buttonClassName,
    className,
    menuCallback = () => {},
    menuActions = [],
    onReorder = () => {},
    children,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const tabListRef = useRef<HTMLDivElement>(null)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  if (!selectedTab) {
    return null
  }

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)} ref={ref}>
      <BaseTabsList className="relative text-xs">
        <Reorder.Group
          axis="x"
          values={tabs.map((tab) => tab.id)}
          onReorder={onReorder}
          className="flex flex-row"
          ref={tabListRef}
        >
          {tabs.map((tab) => {
            //const id = makeTabId(tab, ti)
            //const w = tab.size ?? defaultWidth
            const selected = tab.id === selectedTab.tab.id // tab.id === selectedTab?.tab.id

            return (
              <UnderlineTab
                key={tab.id}
                tab={tab}
                selected={selected}
                maxNameLength={maxNameLength}
                variant={variant}
                menuCallback={menuCallback}
                menuActions={menuActions}
                className={buttonClassName}
                tabListRef={tabListRef}
              />
            )
          })}
        </Reorder.Group>
      </BaseTabsList>
      {children && children}
    </VCenterRow>
  )
})
