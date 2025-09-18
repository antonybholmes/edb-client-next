import { cn } from '@lib/shadcn-utils'
import { useContext, useEffect, useRef, type ComponentProps } from 'react'

import { type ITooltipSide } from '@interfaces/tooltip-side-props'

import { getUrlFriendlyTag } from '@/lib/http/urls'
import {
  getTabName,
  TabContext,
  TabProvider,
} from '@components/tabs/tab-provider'
import gsap from 'gsap'
import { TabsList, TabsTrigger } from '../shadcn/ui/themed/tabs'
import { type IToolbarProps } from '../toolbar/toolbar'
import {
  TabIndicatorContext,
  TabIndicatorProvider,
} from './tab-indicator-provider'
import { TabIndicatorV } from './tab-indicator-v'

const TAB_LINE_CLS =
  'absolute left-0 bg-border top-0 bottom-0 opacity-0 scale-y-50'

interface IShortcutProps extends IToolbarProps {
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

export function SideTabs({
  value = '',
  onTabChange = () => {},
  tabs = [],
  defaultHeight = 1.8,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <TabIndicatorProvider size={defaultHeight} scale={0.7}>
        <SideTabsContent
          defaultHeight={defaultHeight}
          showIcons={showIcons}
          showLabels={showLabels}
          className={className}
        />
      </TabIndicatorProvider>
    </TabProvider>
  )
}

interface ISideTabProps extends ComponentProps<'ul'>, ITooltipSide {
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

function SideTabsContent({
  defaultHeight = 2,
  showIcons = true,
  showLabels = true,
  className,
}: ISideTabProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!
  const pressed = useRef(false)
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLButtonElement[]>([])
  // const h = `${defaultHeight}rem`

  // const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
  //   y: '0rem',
  //   height: `${defaultHeight}rem`,
  // })

  const { setTabIndicatorPos } = useContext(TabIndicatorContext)

  // useEffect(() => {
  //   if (!selectedTab) {
  //     return
  //   }

  //   const x = sum(
  //     rangeMap(index => tabs[index]!.size ?? defaultHeight, selectedTab.index)
  //   )

  //   const height = tabs[selectedTab.index]!.size ?? defaultHeight

  //   setTabPos({ y: `${x + 0.2}rem`, height: `${height - 0.4}rem` })

  //   setTabIndicatorPos({
  //     x: (x + 0.2) * size - s * 0.5,
  //     size: s,
  //     //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
  //   })
  // }, [selectedTab])

  function _scale(index: number, scale: number) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    const h = clientRect.height
    const s = h * scale

    setTabIndicatorPos({
      x: clientRect.top + h / 2 - s * 0.5 - containerRect.top,
      size: s,
    })

    // const s = size * scale

    // setTabIndicatorPos({
    //   x: (index + 0.5) * size - s * 0.5,
    //   size: s,
    //   //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    // })
  }

  useEffect(() => {
    if (selectedTab) {
      _scale(selectedTab.index, pressed.current ? 0.9 : 0.8)
    }
  }, [selectedTab])

  return (
    // <Tabs
    //   orientation="vertical"
    //   value={selectedTab?.tab.id ?? ''}
    //   onValueChange={v => {
    //     const idx = where(tabs, t => t.id === v)
    //     if (idx.length > 0) {
    //       onTabChange?.({ index: idx[0]!, tab: tabs[idx[0]!]! })
    //     }
    //   }}
    // >
    <TabsList
      variant="base"
      className={cn('relative shrink-0', className)}
      ref={tabListRef}
    >
      {tabs.map((tab, ti) => {
        const name = getTabName(tab)
        const selected = ti === selectedTab?.index

        const id = getUrlFriendlyTag(tab.id)

        return (
          <TabsTrigger
            variant="base"
            value={tab.id}
            id={tab.id}
            key={tab.id}
            aria-label={name}
            title={!showLabels ? name : undefined}
            data-checked={selected}
            ref={(el) => {
              buttonsRef.current[ti] = el!
            }}
            onMouseDown={() => {
              pressed.current = true
              onTabChange?.({ index: ti, tab })
            }}
            onMouseEnter={() => {
              if (selected) {
                _scale(selectedTab.index, 1)
              } else {
                gsap.to(`#tab-line-${id}`, {
                  opacity: 1,
                  scaleY: 0.9,
                  duration: 0.2,
                  ease: 'power.inOut',
                })
              }
            }}
            // onMouseDown={() => {
            //   setScale(0.3)
            // }}

            onMouseUp={() => {
              pressed.current = false
            }}
            onMouseLeave={() => {
              if (selected) {
                _scale(selectedTab.index, 0.8)
              } else {
                gsap.to(`#tab-line-${id}`, {
                  opacity: 0,
                  scaleY: 0.5,
                  duration: 0.2,
                  ease: 'power.inOut',
                })
              }
            }}
            className="flex flex-row gap-x-1 items-center data-[checked=true]:font-semibold pl-2 relative"
            style={{ height: `${defaultHeight}rem` }}
          >
            {showIcons && (
              <span
                className="w-4.5 fill-foreground stroke-foreground data-[checked=true]:fill-theme data-[checked=true]:stroke-theme"
                data-checked={ti === selectedTab?.index}
              >
                {tab.icon && tab.icon}
              </span>
            )}
            {showLabels && name}

            {!selected && (
              <span
                id={`tab-line-${id}`}
                data-selected={selected}
                className={TAB_LINE_CLS}
                style={{ width: '0.1rem' }}
              />
            )}
          </TabsTrigger>
        )
      })}

      {/* <motion.span
        className="absolute left-0 w-0.75 z-0 bg-theme rounded-full"
        animate={{ ...tabPos }}
        transition={{ ease: 'easeInOut' }}
      /> */}

      <TabIndicatorV />
    </TabsList>
    // </Tabs>
  )
}
