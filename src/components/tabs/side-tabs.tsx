import { cn } from '@/lib/shadcn-utils'
import { useEffect, useRef } from 'react'

import { getTabFromValue, getTabName } from '@/components/tabs/tab-provider'
import { EMPTY_RECT } from '@/interfaces/rect'
import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'
import { type IToolbarProps } from '../toolbar/toolbar'
import { TabIndicatorFollowV } from './tab-indicator-follow-v'
import { TabIndicatorSelectedV } from './tab-indicator-selected-v'

import {
  TabIndicatorProvider,
  useTabIndicators,
} from './tab-indicator-provider'
import { useTabs } from './tab-store'

interface IShortcutProps extends IToolbarProps {
  id?: string
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

function _SideTabs({
  id = 'side-tabs',
  onTabChange = undefined,

  defaultHeight = 1.9,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  const { tabs, tab: selectedTab, selectedTabIndex, setTab } = useTabs(id)

  console.log('selectedTab', selectedTab)

  //const pressed = useRef(false)
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<(HTMLElement | null)[]>([])
  const initial = useRef(true)
  const {
    position,
    selectedPosition,
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators()

  function _onValueChange(value: string) {
    const tab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //setValue(value)

    console.log('_onValueChange', value, tab, id)

    //onValueChange?.(name)
    if (tab) {
      //setTabIndex(selectedTab.index)

      setTab(value)

      onTabChange?.(tab)
    }
  }

  function updateSelectedSize(buttonRef: HTMLElement, animate = true) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonRef.getBoundingClientRect()

    const y = clientRect.top - containerRect.top
    const h = clientRect.height

    console.log('updateSize', y, h, buttonRef)

    setSelectedTabPosition({
      ...(selectedPosition || EMPTY_RECT),
      y,
      h,
      animate,
      scale: 0.8,
    })
  }

  useEffect(() => {
    console.log('side tabs useEffect', selectedTab, buttonsRef.current)
    if (
      !selectedTab ||
      !buttonsRef.current[selectedTabIndex] ||
      !tabListRef.current
    ) {
      return
    }

    const ref = buttonsRef.current[selectedTabIndex]!

    console.log(
      'asdasd',
      selectedTabIndex,
      buttonsRef.current.length,
      tabs.length
    )

    if (initial.current) {
      initial.current = false
      const timeout = setTimeout(() => {
        updateSelectedSize(ref, false)
      }, 100)

      return () => clearTimeout(timeout) // Cleanup
    } else {
      updateSelectedSize(ref)
      return
    }
  }, [selectedTabIndex, tabs])

  useEffect(() => {
    if (!tabs || tabs.length === 0) {
      return
    }

    // force selection of first tab on mount, to set initial position of indicator
    _onValueChange(getTabName(tabs[0]!))
    //updateSelectedSize(buttonsRef.current[0]!)
  }, [tabs.map((t) => t.id).join('|')])

  function _scale(index: number, isSelected: boolean) {
    if (!isSelected) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      ...(position || EMPTY_RECT),
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.6,
    })
  }

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={_onValueChange}
      className="flex flex-col shrink-0"
      orientation="vertical"
    >
      <TabsList
        className={cn('relative shrink-0 pl-1.5 pr-1', className)}
        ref={tabListRef}
        onMouseLeave={() => {
          setTabPosition(undefined)
        }}
      >
        {tabs.map((tab, ti) => {
          const isSelected = selectedTab?.id === tab.id
          const name = getTabName(tab)
          return (
            <TabsTrigger
              variant="base"
              value={tab.id}
              id={tab.id}
              key={tab.id}
              data-selected={isSelected}
              ref={(el) => {
                buttonsRef.current[ti] = el
              }}
              onMouseEnter={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.6,
                  })
                }
                _scale(selectedTabIndex || 0, isSelected)
              }}
              onMouseLeave={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.8,
                  })
                }
              }}
              className="flex flex-row gap-x-1 items-center data-[selected=true]:font-semibold relative shrink-0 hover:bg-background rounded-theme group"
              style={{
                height: `${defaultHeight}rem`,
                minWidth: `${defaultHeight}rem`,
                justifyContent: showLabels ? 'flex-start' : 'center',
              }}
            >
              {showIcons && tab.icon && (
                <span
                  className="w-4.5 fill-foreground stroke-foreground data-[selected=true]:fill-app-theme data-[selected=true]:stroke-app-theme"
                  data-selected={tab.id === selectedTab?.id}
                >
                  {tab.icon}
                </span>
              )}
              {showLabels && <span className="px-2">{name}</span>}
            </TabsTrigger>
          )
        })}

        <TabIndicatorSelectedV />
        <TabIndicatorFollowV />
      </TabsList>
    </Tabs>
  )
}

export function SideTabs(props: IShortcutProps) {
  return (
    <TabIndicatorProvider>
      <_SideTabs {...props} />
    </TabIndicatorProvider>
  )
}
