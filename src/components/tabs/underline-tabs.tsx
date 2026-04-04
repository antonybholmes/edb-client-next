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
import { type ITabIndicatorPos } from './tab-indicator-provider'
import { useTabIndicators } from './tab-indicator-store'
import { useTabs } from './tab-store'

//export const UNDERLINE_TAB_CLS =
//  'px-2.5 py-1.5 rounded-sm group trans-color focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted trans-color mb-1'

// const TAB_LINE_CLS =
//   'absolute bottom-0 bg-theme left-1.5 right-1.5 pointer-events-none select-none z-20'

// export const tabVariants = cva(
//   cn(
//     FOCUS_INSET_RING_CLS,
//     'group trans-color trans-color flex flex-row items-center'
//   ),
//   {
//     variants: {
//       variant: {
//         default:
//           'overflow-hidden focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted px-2 py-1',
//         sheet:
//           'focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted',
//         tab: '',
//       },
//     },
//     defaultVariants: { variant: 'default' },
//   }
// )

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

//export const UNDERLINE_LABEL_CLS = `boldable-text-tab data-[checked=true]:opacity-0 data-[hover=true]:opacity-0
//group-focus-visible:opacity-0 trans-opacity text-alt-foreground truncate relative pointer-events-none select-none`

export const UNDERLINE_LABEL_CLS = `boldable-text-tab data-[checked=true]:font-semibold data-[hover=true]:text-foreground
data-[checked=true]:text-foreground text-alt-foreground truncate relative pointer-events-none select-none`

export const UNDERLINE_HOVER_LABEL_CLS = `z-40 opacity-0 font-semibold data-[hover=true]:opacity-100
data-[checked=true]:opacity-100 group-focus-visible:opacity-100 trans-opacity absolute 
top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 truncate pointer-events-none select-none`

// export function ToolbarTabLine({ tabPos }: { tabPos: ITabPos }) {
//   return (
//     <motion.span
//       className="absolute bottom-0 h-0.5 z-0 bg-theme"
//       animate={{ ...tabPos }}
//       transition={{ ease: 'easeInOut', duration: ANIMATION_DURATION_S }}
//       initial={false}
//       //transition={{ type: "spring" }}
//     />
//   )
// }

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

// interface ITabProps extends ITabTrigger {
//   ti: number
//   tab: ITab
//   selectedTab: ISelectedTab | null
//   scale: (scale: number) => void
//   maxNameLength: number,

// }

// function Tab({ tab, selectedTab, scale, maxNameLength, ...props }: ITabProps) {
//   const selected = tab.id === selectedTab?.tab.id // tab.id === selectedTab?.tab.id

//   const name = getTabName(tab)
//   const truncatedName = truncate(name, {
//     length: maxNameLength,
//   })

//   return (
//     <TabsTrigger
//       variant="base"
//       value={tab.id}
//       id={tab.id}
//       key={tab.id}
//       data-selected={selected}
//       ref={ref}
//       onMouseEnter={() => {
//         if (selected) {
//           scale(2)
//         }
//       }}
//       onMouseLeave={() => {
//         if (selected) {
//           scale(1)
//         }
//       }}
//       onMouseDown={() => {
//         pressed.current = true
//       }}
//       onMouseUp={() => {
//         pressed.current = false
//       }}
//       className={tabButtonVariants({
//         variant,
//       })}
//     >
//       <span
//         data-checked={selected}
//         ref={(el) => {
//           itemsRef.current[ti] = el!
//         }}
//         aria-label={tab.id}
//         className={UNDERLINE_LABEL_CLS}
//       >
//         {truncatedName}
//       </span>

//       <span
//         data-selected={selected}
//         className={TAB_LINE_CLS}
//         style={{ height: '0.1rem' }}
//       />
//     </TabsTrigger>
//   )
// }

interface ITriggerProps extends VariantProps<typeof tabButtonVariants> {
  tab: ITab
  ti: number
  selectedTab?: ITab | undefined
  tabListRef: RefObject<HTMLDivElement | null>
  buttonsRef: RefObject<HTMLElement[]>
  maxNameLength: number
  groupId: string
  tabs: number
}

function Trigger({
  variant,
  tab,
  ti,
  selectedTab,
  buttonsRef,
  groupId,
  tabListRef,
  maxNameLength,
  tabs,
}: ITriggerProps) {
  const { setPosition: setTabPosition } = useTabIndicators(groupId)

  const ref = useRef<HTMLSpanElement>(null)
  //const [hover, setHover] = useState(false)

  const selected = tab.id === selectedTab?.id // tab.id === selectedTab?.tab.id

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
    //const offset = remToPx(0.5) // half padding of button
    //x -= offset
    //w += offset * 2

    setTabPosition({
      x,
      //y: 0,
      w,
      h: clientRect.height,
      //animate: true,
      //scale: 1,
      index,
      tabs,
    })

    //setScale(1.5)
  }

  return (
    <span
      data-selected={selected}
      ref={el => {
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
  //tabIndicator?: ReactNode
  tabButtonProps?: VariantProps<typeof tabButtonVariants>
  selectedMouseOverSize?: SelectedMouseOverSize
  tabListCls?: string
}

export function UnderlineTabs({
  groupId,
  tabs,
  maxNameLength = -1,
  //tabIndicator = <TabIndicatorFollowH />,
  tabButtonProps = { variant: 'toolbar' },
  onTabChange,
  tabListCls,
  children,
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])
  const initial = useRef(true)
  const { tab: selectedTab, setTab } = useTabs(groupId)
  const {
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators(groupId)

  //const [tabIndex, setTabIndex] = useState(0)

  // const setTriggerRef = (key: string) => (el: HTMLButtonElement | null) => {
  //   buttonsRef.current[key] = el
  // }

  //const itemsRef = useRef<HTMLSpanElement[]>([])
  //const [userInteraction, setUserInteraction] = useState(false)

  //const [_value, setValue] = useState(value)

  //const selectedTab = tabs[tabIndex] //useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  function updateSelectedTabSize(
    index: number,
    buttonRef: HTMLElement,
    animate = true
  ) {
    if (!tabListRef.current) {
      return
    }

    const containerRect = tabListRef.current.getBoundingClientRect()

    //const clientRect = userInteraction
    //  ? buttonsRef.current[selectedTab.index]!.getBoundingClientRect()
    //  : itemsRef.current[selectedTab.index]!.getBoundingClientRect()

    const clientRect = buttonRef.getBoundingClientRect()

    let x = clientRect.left - containerRect.left
    let w = clientRect.width

    //console.log('updateSelectedTabSize', x, w, clientRect, containerRect.left)

    setSelectedTabPosition({
      x,
      w,
      //y: 0,
      h: clientRect.height,
      animate,
      index,
      tabs: tabs.length,
      //scale: 1,
    })
  }

  // useEffect(() => {
  //   setValue(value)
  // }, [value])

  //const [scale, setScale] = useState(1)

  //const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  const defaultValue = useRef(tabs[0]?.id ?? '')

  function _onValueChange(value: string) {
    const selectedTab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //setValue(value)

    //onValueChange?.(name)
    if (selectedTab) {
      //console.log('ToolbarMenu _onValueChange', value, selectedTab)
      //setTabIndex(selectedTab.index)
      setTab({ id: selectedTab.tab.id, index: selectedTab.index })

      onTabChange?.(selectedTab)
    }
  }

  // useEffect(() => {
  //   setTab(0)
  // }, [])

  //resize if ui element changes size
  useEffect(() => {
    if (
      !selectedTab ||
      !buttonsRef.current[selectedTab.index] ||
      !tabListRef.current
    ) {
      return
    }

    // console.log('Tsab index changed to', tabIndex, el)

    //initial.current = false

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

    // for the initial setup, wait a bit for things to settle
    // This is to ensure that the layout is stable before measuring
    // the size and position of the tab elements. A bit of a hack,
    // but so is a lot of UI programming in html because
    // if (initial.current) {
    //   initial.current = false
    //   const timeout = setTimeout(() => {
    //     updateSelectedTabSize(buttonsRef.current[tabIndex]!, false)
    //   }, 100)

    //   return () => {
    //     clearTimeout(timeout) // Cleanup
    //     //observer.disconnect()
    //   }
    // }

    updateSelectedTabSize(
      selectedTab.index,
      buttonsRef.current[selectedTab.index]!,
      !initial.current
    )

    initial.current = false

    return () => {
      //console.log('disconnect observer', selectedTab?.index)
      observer.disconnect()
    }

    // const rafId = requestAnimationFrame(() => {
    //   console.log(
    //     'Tab index changed to',
    //     tabIndex,
    //     tabListRef.current?.getBoundingClientRect(),
    //     el.getBoundingClientRect()
    //   )
    //   updateSelectedTabSize(el, initial.current)
    // })

    //return () => cancelAnimationFrame(rafId)
    //return
  }, [selectedTab?.index])

  // useEffect(() => {
  //   if (selectedTab) {
  //     // the first render is for setup, after that
  //     // scale the line to max width because this is
  //     // when the user starts clicking on tabs
  //     _scale(pressed.current ? 2 : 1)
  //   }
  // }, [selectedTab?.index])

  return (
    <Tabs
      id="toolbar-menu-tabs"
      defaultValue={defaultValue.current}
      //defaultValue={_value === "" ? `${tabs[0].name}:0`:undefined}
      onValueChange={_onValueChange}
      orientation="horizontal"
      className="relative"
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
                groupId={groupId}
                tabListRef={tabListRef}
                buttonsRef={buttonsRef}
                selectedTab={selectedTab}
                maxNameLength={maxNameLength}
                variant={tabButtonProps.variant}
              />
            </TabsTrigger>
          )
        })}

        {/* {tabIndicator} */}
        {children}
      </TabsList>
    </Tabs>
  )
}
