import { type IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { useContext, useEffect, useState } from 'react'

import { type ITooltipSide } from '@interfaces/tooltip-side-props'

import { getTabName, TabContext, TabProvider } from '@components/tab-provider'
import { rangeMap } from '@lib/math/range'
import { sum } from '@lib/math/sum'
import { motion } from 'motion/react'
import { type IToolbarProps } from './toolbar'

interface IShortcutProps extends IToolbarProps {
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

export function SideTabs({
  value,
  onTabChange = () => {},
  tabs = [],
  defaultHeight = 1.8,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <SideTabsContent
        defaultHeight={defaultHeight}
        showIcons={showIcons}
        showLabels={showLabels}
        className={className}
      />
    </TabProvider>
  )
}

interface ISideTabProps extends IElementProps, ITooltipSide {
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

export function SideTabsContent({
  defaultHeight = 2,
  showIcons = true,
  showLabels = true,
  className,
  ...props
}: ISideTabProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const h = `${defaultHeight}rem`

  const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
    y: '0rem',
    height: `${defaultHeight}rem`,
  })

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const x = sum(
      rangeMap(index => tabs[index]!.size ?? defaultHeight, selectedTab.index)
    )

    const height = tabs[selectedTab.index]!.size ?? defaultHeight

    setTabPos({ y: `${x + 0.2}rem`, height: `${height - 0.4}rem` })
  }, [selectedTab.index])

  return (
    <div
      className={cn('relative flex shrink-0 flex-col pl-3 pr-2', className)}
      {...props}
    >
      {tabs.map((tab, ti) => {
        const name = getTabName(tab)
        return (
          <button
            key={ti}
            aria-label={name}
            data-selected={ti === selectedTab.index}
            onClick={() => onTabChange?.({ index: ti, tab })}
            style={{ height: h }}
            className="flex flex-row gap-x-1 items-center group-hover:font-semibold data-[selected=true]:font-semibold"
          >
            {showIcons && (
              <span
                className="w-5 max-w-5 fill-foreground stroke-foreground data-[selected=true]:fill-theme data-[selected=true]:stroke-theme"
                data-selected={ti === selectedTab.index}
              >
                {tab.icon && tab.icon}
              </span>
            )}
            {showLabels && <span>{name}</span>}
          </button>
        )
      })}

      <motion.span
        className="absolute left-0 w-0.75 z-0 bg-theme rounded-full"
        animate={{ ...tabPos }}
        transition={{ ease: 'easeInOut' }}
      />
    </div>
  )
}
