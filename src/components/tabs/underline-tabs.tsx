import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

import type { IChildrenProps } from '@/interfaces/children-props'
import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { cn } from '@/lib/shadcn-utils'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from './tab-provider'

import { cva, type VariantProps } from 'class-variance-authority'

import { truncate } from '@/lib/text/text'
import { remToPx } from '../utils'
import {
  TabIndicatorProvider,
  useTabIndicators,
  type ITabIndicatorPos,
} from './tab-indicator-provider'

import { useTabs } from './tab-store'

export const UNDERLINE_LABEL_CLS = `boldable-text-tab data-[checked=true]:font-medium data-[hover=true]:text-foreground
data-[checked=true]:text-foreground text-alt-foreground truncate relative pointer-events-none select-none`

export const UNDERLINE_HOVER_LABEL_CLS = `z-40 opacity-0 font-medium data-[hover=true]:opacity-100
data-[checked=true]:opacity-100 group-focus-visible:opacity-100 trans-opacity absolute 
top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate pointer-events-none select-none`

export const tabButtonVariants = cva('group overflow-hidden', {
  variants: {
    variant: {
      none: '',
      default: 'h-8 px-2',
      toolbar: 'h-8',
      sheet:
        'py-1.5 px-3 w-16 flex flex-row justify-center focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted',
      tab: 'border',
    },
  },
  defaultVariants: { variant: 'default' },
})

type SelectedMouseOverSize = (
  index: number,
  tabs: number,
  containerRef: HTMLElement,
  buttonRef: HTMLElement,
  animate: boolean
) => ITabIndicatorPos

export function getSelectedMouseOverSize(
  index: number,
  tabs: number,
  containerRef: HTMLElement,
  buttonRef: HTMLElement,
  animate: boolean = true,
  scale: number = 1
): ITabIndicatorPos {
  const containerRect = containerRef!.getBoundingClientRect()

  const clientRect = buttonRef.getBoundingClientRect()

  let x = clientRect.left - containerRect.left
  let w = clientRect.width

  return {
    x,
    y: 0,
    w,
    h: clientRect.height,
    animate,
    scale,
    index,
    tabs,
  }
}

export function getUnderlineSelectedMouseOverSize(
  index: number,
  tabs: number,
  containerRef: HTMLElement,
  buttonRef: HTMLElement,
  animate: boolean = true,
  scale: number = 1
): ITabIndicatorPos {
  const containerRect = containerRef!.getBoundingClientRect()

  const clientRect = buttonRef.getBoundingClientRect()

  let x = clientRect.left - containerRect.left
  let w = clientRect.width
  const offset = remToPx(0.5) // half padding of button
  x -= offset
  w += offset * 2

  return {
    x,
    y: 0,
    w,
    h: clientRect.height,
    animate,
    scale,
    index,
    tabs,
  }
}

export interface IMenuAction {
  action: string
  icon?: ReactNode
}

export interface ITabMenu {
  menuCallback?: (tab: ITab, action: string) => void
  menuActions?: IMenuAction[]
}

interface ITriggerProps extends VariantProps<typeof tabButtonVariants> {
  tab: ITab
  ti: number
  selectedTab?: ITab | undefined
  tabListRef: RefObject<HTMLDivElement | null>
  buttonsRef: RefObject<HTMLElement[]>
  maxNameLength: number
  tabs: number
}

function Trigger({
  variant,
  tab,
  ti,
  selectedTab,
  buttonsRef,
  tabListRef,
  maxNameLength,
  tabs,
}: ITriggerProps) {
  const { setPosition: setTabPosition } = useTabIndicators() //groupId)

  const ref = useRef<HTMLSpanElement>(null)
  //const [hover, setHover] = useState(false)

  const selected = tab.id === selectedTab?.id

  const name = getTabName(tab)

  const truncatedName = truncate(name, {
    length: maxNameLength,
  })

  function _scale(index: number) {
    if (!tabListRef.current || !buttonsRef.current[index]) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    let x = clientRect.left - containerRect.left
    let w = clientRect.width

    setTabPosition({
      x,
      w,
      h: clientRect.height,
      index,
      tabs,
    })
  }

  return (
    <span
      data-selected={selected}
      ref={(el) => {
        ref.current = el
        buttonsRef.current[ti] = el!
      }}
      onMouseEnter={() => {
        _scale(ti)
      }}
      className={tabButtonVariants({
        variant,
        className: 'flex flex-row items-center justify-center',
      })}
    >
      <span
        data-checked={selected}
        aria-label={truncatedName}
        className={UNDERLINE_LABEL_CLS}
      >
        {truncatedName}
      </span>
    </span>
  )
}

interface IProps extends ITabProvider, IChildrenProps, ITabMenu {
  groupId: string
  buttonClassName?: string
  maxNameLength?: number
  tabButtonProps?: VariantProps<typeof tabButtonVariants>
  selectedMouseOverSize?: SelectedMouseOverSize
  tabListCls?: string
}

export function _UnderlineTabs({
  groupId,
  tabs,
  maxNameLength = -1,
  tabButtonProps = { variant: 'toolbar' },
  onTabChange,
  tabListCls,
  className,
  children,
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])
  const initial = useRef(true)
  const { tab: selectedTab, setTab } = useTabs(groupId)
  // const {
  //   setPosition: setTabPosition,
  //   setSelectedPosition: setSelectedTabPosition,
  // } = useTabIndicators(groupId)

  const {
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators()

  function updateSelectedTabSize(
    index: number,
    buttonRef: HTMLElement,
    animate = true
  ) {
    if (!tabListRef.current) {
      return
    }

    const containerRect = tabListRef.current.getBoundingClientRect()

    const clientRect = buttonRef.getBoundingClientRect()

    let x = clientRect.left - containerRect.left
    let w = clientRect.width

    setSelectedTabPosition({
      x,
      w,
      h: clientRect.height,
      animate,
      index,
      tabs: tabs.length,
    })
  }

  const defaultValue = useRef(tabs[0]?.id ?? '')

  function _onValueChange(value: string) {
    const selectedTab = getTabFromValue(value, tabs)

    if (selectedTab) {
      setTab({ id: selectedTab.tab.id, index: selectedTab.index })

      onTabChange?.(selectedTab)
    }
  }

  //resize if ui element changes size
  useEffect(() => {
    if (
      !selectedTab ||
      !buttonsRef.current[selectedTab.index] ||
      !tabListRef.current
    ) {
      return
    }

    const observer = new ResizeObserver(() => {
      updateSelectedTabSize(
        selectedTab.index,
        buttonsRef.current[selectedTab.index]!,
        false
      )
    })

    observer.observe(buttonsRef.current[selectedTab.index]!)
    //observe parent container too
    observer.observe(tabListRef.current)

    updateSelectedTabSize(
      selectedTab.index,
      buttonsRef.current[selectedTab.index]!,
      !initial.current
    )

    initial.current = false

    return () => {
      observer.disconnect()
    }
  }, [selectedTab?.index])

  return (
    <Tabs
      id="toolbar-menu-tabs"
      defaultValue={defaultValue.current}
      onValueChange={_onValueChange}
      orientation="horizontal"
      className={cn('relative', className)}
    >
      <TabsList
        className={cn('relative', tabListCls)}
        ref={tabListRef}
        id="underline-tabs"
        onMouseLeave={() => {
          setTabPosition(undefined)
        }}
      >
        {tabs.map((tab, ti) => {
          return (
            <TabsTrigger
              variant="base"
              key={tab.id}
              value={tab.id}
              id={tab.id}
              className="z-30"
            >
              <Trigger
                tab={tab!}
                ti={ti}
                key={tab.id}
                tabs={tabs.length}
                tabListRef={tabListRef}
                buttonsRef={buttonsRef}
                selectedTab={selectedTab}
                maxNameLength={maxNameLength}
                variant={tabButtonProps.variant}
              />
            </TabsTrigger>
          )
        })}

        {children}
      </TabsList>
    </Tabs>
  )
}

export function UnderlineTabs(props: IProps) {
  return (
    <TabIndicatorProvider>
      <_UnderlineTabs {...props} />
    </TabIndicatorProvider>
  )
}
