import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { getTabName, useTabs, type ITab } from './tab-provider'

import { cn } from '@/lib/shadcn-utils'
import { truncate } from '@/lib/text/text'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { VariantProps } from 'class-variance-authority'
import { toggleGroupVariants } from '../shadcn/ui/themed/v2/toggle-group'
import { TabIndicatorIosSelected } from './tab-indicator-ios-selected'
import { useTabIndicators } from './tab-indicator-provider'

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
  defaultWidth?: string
}

export function IOSTabs({
  id = 'ios-tabs',
  maxNameLength = -1,
  defaultWidth = '5rem',
}: IProps) {
  const { tabs, selectedTab, selectedTabIndex, setTab } = useTabs(id)
  const { selectedPosition, setSelectedPosition } = useTabIndicators()

  const tabListRef = useRef<HTMLDivElement>(null)

  const buttonsRef = useRef<HTMLElement[]>([])
  const [focus, setFocus] = useState(false)

  //const isHydrated = useHydrated()

  useEffect(() => {
    if (!buttonsRef.current[selectedTabIndex] || !tabListRef.current) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRef = buttonsRef.current[selectedTabIndex]!

    const clientRect = clientRef.getBoundingClientRect()

    setSelectedPosition({
      ...selectedPosition,
      x: clientRect.left - containerRect.left,
      w: clientRect.width,
    })
  }, [selectedTabIndex])

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={(v) => {
        setTab(v)
      }}
      orientation="horizontal"
      className="bg-muted/40 rounded-full p-0.5 text-xs"
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
                'z-30 data-[checked=true]:font-semibold h-8'
              )}
              style={{ width: defaultWidth }}
              // onMouseEnter={() => {
              //   if (isSelected) {
              //     setSelectedPosition({
              //       scale: 1.1,
              //     })
              //   }
              // }}
              // onMouseLeave={() => {
              //   if (isSelected) {
              //     setSelectedPosition({
              //       scale: 1,
              //     })
              //   }
              // }}
            >
              {truncatedName}
            </TabsTrigger>

            // <TabsTrigger key={tab.id} value={tab.id}>{tab.id}</TabsTrigger>
          )
        })}
        <TabIndicatorIosSelected defaultWidth={defaultWidth} />
      </TabsList>
    </Tabs>
  )
}
