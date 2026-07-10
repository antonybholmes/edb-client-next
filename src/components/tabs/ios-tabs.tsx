import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { getTabName, useTabs, type ITab } from './tab-provider'

import { cn } from '@/lib/shadcn-utils'
import { truncate } from '@/lib/text/text'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { VariantProps } from 'class-variance-authority'
import { toggleGroupVariants } from '../shadcn/ui/themed/v2/toggle-group'
import { TabIndicatorIosSelected } from './tab-indicator-ios-selected'
import {
  TabIndicatorProvider,
  useTabIndicators,
} from './tab-indicator-provider'

export interface IMenuAction {
  action: string
  icon?: ReactNode
}

export interface ITabMenu {
  menuCallback?: (tab: ITab, action: string) => void
  menuActions?: IMenuAction[]
}

interface IProps extends ITabMenu, VariantProps<typeof toggleGroupVariants> {
  id?: string
  buttonClassName?: string
  maxNameLength?: number
  defaultWidth?: number
}

function _IosTabs({
  id = 'ios-tabs',
  maxNameLength = -1,
  defaultWidth = 5,
}: IProps) {
  const { tabs, selectedTab, selectedTabIndex, setTab } = useTabs(id)
  const { selectedPosition, setSelectedPosition } = useTabIndicators()

  const tabListRef = useRef<HTMLDivElement>(null)

  const buttonsRef = useRef<HTMLElement[]>([])
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    // if (!buttonsRef.current[selectedTabIndex] || !tabListRef.current) {
    //   return
    // }

    // const idx = tabs.findIndex((t) => t.id === selectedTab?.id)

    // if (idx === -1) {
    //   return
    // }

    // const containerRect = tabListRef.current!.getBoundingClientRect()

    //const clientRef = buttonsRef.current[selectedTabIndex]!

    //const clientRect = clientRef.getBoundingClientRect()

    setSelectedPosition({
      ...selectedPosition,
      x: `${selectedTabIndex * defaultWidth}rem`,
      w: `${defaultWidth}rem`,
    })
  }, [selectedTabIndex])

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={(v) => {
        setTab(v)
      }}
      orientation="horizontal"
      className="bg-muted/40 rounded-full p-0.5 border border-border/30 text-xs"
    >
      <TabsList
        ref={tabListRef}

        data-focus={focus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="relative overflow-hidden rounded-full"
        variant="default"
      >
        {tabs?.map((tab, ti) => {
          //const id = makeTabId(tab, ti)
          //const w = tab.size ?? defaultWidth
          const isSelected = tab.id === selectedTab?.id // tab.id === selectedTab?.tab.id

          const name = getTabName(tab)
          const truncatedName = truncate(name, {
            length: maxNameLength,
          })

          return (
            <TabsTrigger
              variant="none"
              rounded="full"
              value={tab.id}
              id={tab.id}
              key={tab.id}
              data-checked={isSelected}
              ref={(el) => {
                if (el) {
                  buttonsRef.current[ti] = el
                }
              }}
              className={cn(
                FOCUS_INSET_RING_CLS,
                'z-30 data-[checked=true]:font-semibold h-7'
              )}
              style={{ width: `${defaultWidth}rem` }}
            >
              {truncatedName}
            </TabsTrigger>
          )
        })}
        <TabIndicatorIosSelected />
      </TabsList>
    </Tabs>
  )
}

export function IosTabs(props: IProps) {
  return (
    <TabIndicatorProvider>
      <_IosTabs {...props} />
    </TabIndicatorProvider>
  )
}
