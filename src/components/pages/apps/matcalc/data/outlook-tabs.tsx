import { cn } from '@/lib/shadcn-utils'
import { useEffect, useRef } from 'react'

import { getTabName, useTabs } from '@/components/tabs/tab-provider'

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowV } from '@/components/tabs/tab-indicator-follow-v'
import {
  TabIndicatorProvider,
  useTabIndicators,
} from '@/components/tabs/tab-indicator-provider'
import { TabIndicatorSelectedV } from '@/components/tabs/tab-indicator-selected-v'
import { IClassProps } from '@/interfaces/class-props'

interface IShortcutProps extends IClassProps {
  id?: string
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

function _OutlookTabs({
  id = 'side-tabs',
  defaultHeight = 2,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  const { tabs, selectedTab, selectedTabIndex, setTab } = useTabs(id)

  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])
  const initial = useRef(true)

  const {
    position,
    selectedPosition,
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators()

  function updateSelectedSize(buttonRef: HTMLElement, animate = true) {
    if (!tabListRef.current || !buttonRef) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonRef.getBoundingClientRect()

    const y = clientRect.top - containerRect.top
    const h = clientRect.height

    setSelectedTabPosition({
      ...selectedPosition,
      y,
      h,
      animate,
      scale: 0.7,
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

    //if (!initial.current) {
    updateSelectedSize(ref, false)
    //}

    initial.current = false
  }, [selectedTabIndex, tabs])

  useEffect(() => {
    if (!tabs || tabs.length === 0) {
      return
    }

    // force selection of first tab on mount, to set initial position of indicator
    setTab(tabs[0].id)
  }, [tabs])

  function _scale(index: number) {
    if (!buttonsRef.current[index] || !tabListRef.current) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      ...position,
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.5,
    })
  }

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={setTab}
      orientation="vertical"
    >
      <TabsList
        className={cn('relative shrink-0 pl-2 gap-y-px', className)}
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
              variant="sidebar"
              value={tab.id}
              id={tab.id}
              key={tab.id}
              data-selected={isSelected}
              ref={(el) => {
                if (el) {
                  buttonsRef.current[ti] = el
                }
              }}
              onMouseEnter={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.5,
                  })
                }

                _scale(ti || 0)
              }}
              onMouseLeave={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.7,
                  })
                }
              }}
              className="flex flex-row gap-x-1.5 items-center data-[selected=true]:font-semibold relative shrink-0 hover:bg-background rounded-theme group"
              style={{
                height: `${defaultHeight}rem`,
                minWidth: `${defaultHeight}rem`,
                justifyContent: showLabels ? 'flex-start' : 'center',
              }}
            >
              {showIcons && tab.icon && (
                <span
                  className="w-4.5 fill-foreground stroke-foreground"
                  data-selected={tab.id === selectedTab?.id}
                >
                  {tab.icon}
                </span>
              )}
              {showLabels && <span>{name}</span>}
            </TabsTrigger>
          )
        })}

        <TabIndicatorSelectedV />
        <TabIndicatorFollowV />
      </TabsList>
    </Tabs>
  )
}

export function OutlookTabs(props: IShortcutProps) {
  return (
    <TabIndicatorProvider>
      <_OutlookTabs {...props} />
    </TabIndicatorProvider>
  )
}
