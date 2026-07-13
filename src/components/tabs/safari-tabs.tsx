import { useRef, useState, type ReactNode } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'

import { getTabName, useTabs, type ITab } from './tab-provider'

import { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { truncate } from '@/lib/text/text'
import { VariantProps } from 'class-variance-authority'
import { toggleGroupVariants } from '../shadcn/ui/themed/v2/toggle-group'

export interface IMenuAction {
  action: string
  icon?: ReactNode
}

export interface ITabMenu {
  menuCallback?: (tab: ITab, action: string) => void
  menuActions?: IMenuAction[]
}

interface IProps
  extends IClassProps, ITabMenu, VariantProps<typeof toggleGroupVariants> {
  id?: string
  buttonClassName?: string
  maxNameLength?: number
  defaultWidth?: number
}

export function SafariTabs({
  id = 'safari-tabs',
  maxNameLength = -1,
  defaultWidth = 5,
  className,
}: IProps) {
  const { tabs, selectedTab, setTab } = useTabs(id)

  const tabListRef = useRef<HTMLDivElement>(null)

  const buttonsRef = useRef<HTMLElement[]>([])
  const [focus, setFocus] = useState(false)

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={(v) => {
        setTab(v)
      }}
      orientation="horizontal"
      className={cn('text-xs', className)}
    >
      <TabsList
        ref={tabListRef}

        data-focus={focus}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="gap-x-px"
      >
        {tabs?.map((tab, ti) => {
          const isSelected = tab.id === selectedTab?.id // tab.id === selectedTab?.tab.id

          const name = getTabName(tab)
          const truncatedName = truncate(name, {
            length: maxNameLength,
          })

          return (
            <TabsTrigger
              variant="safari"
              rounded="theme"
              value={tab.id}
              id={tab.id}
              key={tab.id}
              data-checked={isSelected}
              ref={(el) => {
                if (el) {
                  buttonsRef.current[ti] = el
                }
              }}

              style={{ width: `${defaultWidth}rem` }}
            >
              {tab.icon && tab.icon}
              {truncatedName}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
