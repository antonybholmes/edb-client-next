import { forwardRef, useMemo, useState, type ForwardedRef } from 'react'

import type { IChildrenProps } from '@interfaces/children-props'
import { TabContentPanels, Tabs } from '../shadcn/ui/themed/tabs'

import type { LeftRightPos } from '../side'
import { getTabFromValue, type ITabProvider } from '../tab-provider'
import { UnderlineTabs } from '../toolbar/underline-tabs'
import { CloseButton, SlideBar, SlideBarContent } from './slide-bar'

interface IProps extends ITabProvider, IChildrenProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  position?: number
  limits?: [number, number]
  side?: LeftRightPos
  display?: 'block' | 'flex'
}

export const TabSlideBar = forwardRef(function TabSlideBar(
  {
    value,
    tabs,
    onTabChange,
    open,
    //value,
    //onValueChange,
    onOpenChange,
    position = 80,
    limits = [5, 85],
    side = 'Left',
    className,
    children,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const [_value, setValue] = useState('')
  const [_open, setOpen] = useState(true)
  const [hover, setHover] = useState(false)

  const isOpen: boolean = open !== undefined ? open : _open

  const val = value !== undefined ? value : _value

  const selectedTab = useMemo(() => getTabFromValue(val, tabs), [val, tabs])

  if (!selectedTab) {
    return null
  }

  function _onOpenChange(state: boolean) {
    setOpen(state)
    onOpenChange?.(state)
  }

  function _onValueChange(value: string) {
    const tab = getTabFromValue(value, tabs)

    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (tab) {
      onTabChange?.(tab)
    }

    setValue(value)
  }

  const tabsElem = useMemo(() => {
    const selectedTabId = selectedTab.tab.id // getTabId(selectedTab.tab)

    //console.log('Selected tab', selectedTabId)

    return (
      <Tabs
        className="flex min-h-0 flex-col relative grow gap-y-2 pr-2"
        value={selectedTabId} //selectedTab?.tab.id}
        //defaultValue={_value === "" ? `${tabs[0].name}:0`:undefined}
        onValueChange={_onValueChange}
        orientation="horizontal"
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <UnderlineTabs value={selectedTabId} tabs={tabs}>
          <CloseButton
            onClick={() => _onOpenChange(false)}
            data-hover={hover}
            //className="trans-opacity data-[hover=true]:opacity-100 opacity-0"
          />
        </UnderlineTabs>

        <TabContentPanels tabs={tabs} />
        {/* {selectedTab.tab.content}   */}
      </Tabs>
    )
  }, [val, tabs, hover, selectedTab])

  return (
    <SlideBar
      open={isOpen}
      onOpenChange={_onOpenChange}
      side={side}
      position={position}
      limits={limits}
      mainContent={children}
      sideContent={tabsElem}
    >
      <SlideBarContent className={className} />
    </SlideBar>
  )
})
