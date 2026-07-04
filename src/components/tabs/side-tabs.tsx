import { cn } from '@/lib/shadcn-utils'
import { useEffect, useRef } from 'react'

import {
  getTabFromValue,
  getTabName,
  useTabs,
} from '@/components/tabs/tab-provider'
import { EMPTY_RECT } from '@/interfaces/rect'
import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { TabIndicatorFollowV } from './tab-indicator-follow-v'
import { TabIndicatorSelectedV } from './tab-indicator-selected-v'

import { IClassProps } from '@/interfaces/class-props'
import {
  TabIndicatorProvider,
  useTabIndicators,
} from './tab-indicator-provider'

interface IShortcutProps extends IClassProps {
  id?: string
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

function _SideTabs({
  id = 'side-tabs',
  defaultHeight = 1.9,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  const { tabs, selectedTab, selectedTabIndex, setTab } = useTabs(id)

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

    if (tab) {
      setTab(value)
    }
  }

  function updateSelectedSize(buttonRef: HTMLElement, animate = true) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonRef.getBoundingClientRect()

    const y = clientRect.top - containerRect.top
    const h = clientRect.height

    setSelectedTabPosition({
      ...(selectedPosition || EMPTY_RECT),
      y,
      h,
      animate,
      scale: 0.8,
    })
  }

  useEffect(() => {
    if (
      !selectedTab ||
      !buttonsRef.current[selectedTabIndex] ||
      !tabListRef.current
    ) {
      return
    }

    const ref = buttonsRef.current[selectedTabIndex]!

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
  }, [tabs.map((t) => t.id).join('|')])

  function _scale(index: number, isSelected: boolean) {
    if (
      !isSelected ||
      !buttonsRef.current[index] ||
      !tabListRef.current ||
      !position
    ) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      ...position,
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.6,
    })
  }

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={_onValueChange}
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
