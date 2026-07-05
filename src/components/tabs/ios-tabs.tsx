import { useEffect, useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { getTabName, useTabs, type ITab } from './tab-provider'

import { cn } from '@/lib/shadcn-utils'
import { truncate } from '@/lib/text/text'
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
  defaultWidth = '80px',
}: IProps) {
  const { tabs, selectedTab, selectedTabIndex, setTab } = useTabs(id)
  const { selectedPosition, setSelectedPosition } = useTabIndicators()

  const tabListRef = useRef<HTMLDivElement>(null)

  const buttonsRef = useRef<HTMLButtonElement[]>([])
  const [focus, setFocus] = useState(false)

  useEffect(() => {
    if (!buttonsRef.current[selectedTabIndex] || !tabListRef.current) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRef = buttonsRef.current[selectedTabIndex]!

    const clientRect = clientRef.getBoundingClientRect()

    console.log(clientRect)

    const h = clientRect.height

    setSelectedPosition({
      ...selectedPosition,
      x: clientRect.left - containerRect.left,
      y: 1,
      w: clientRect.width,
      h,

      //scale: 0.6,
    })
  }, [selectedTabIndex])

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={setTab}
      orientation="horizontal"
    >
      <TabsList
        ref={tabListRef}

        data-focus={focus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="relative"
        variant="ios"
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
              value={tab.id}
              id={tab.id}
              key={tab.id}
              data-checked={isSelected}
              ref={(el) => {
                buttonsRef.current[ti] = el as HTMLButtonElement
              }}
              className={cn('z-30 data-[checked=true]:font-semibold h-8')}
              style={{ width: defaultWidth }}
              // onMouseEnter={() => {
              //   if (isSelected) {
              //     setSelectedPosition({
              //       scale: 0.6,
              //     })
              //   }
              // }}
              // onMouseLeave={() => {
              //   if (isSelected) {
              //     setSelectedPosition({
              //       scale: 0.8,
              //     })
              //   }
              // }}
            >
              {truncatedName}
            </TabsTrigger>

            // <TabsTrigger key={tab.id} value={tab.id}>{tab.id}</TabsTrigger>
          )
        })}
        <TabIndicatorIosSelected />
      </TabsList>
    </Tabs>
  )
}
