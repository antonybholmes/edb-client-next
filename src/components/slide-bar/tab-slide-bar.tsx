import { useMemo, useState } from 'react'

import { TabContentPanels, Tabs } from '../shadcn/ui/themed/tabs'

import { TabIndicatorProvider } from '../tabs/tab-indicator-provider'
import { getTabFromValue, type ITabProvider } from '../tabs/tab-provider'
import { UnderlineTabs } from '../tabs/underline-tabs'

import { CloseButton, SlideBar, type ISlideBarProps } from './slide-bar'

interface IProps extends ITabProvider, ISlideBarProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  showCloseButton?: boolean
  limits?: [number, number]
  display?: 'block' | 'flex'
}

export function TabSlideBar({
  id,
  ref,
  value,
  tabs,
  onTabChange,
  open,
  showCloseButton = true,
  onOpenChange,
  initialPosition: position = 80,
  limits = [50, 85],
  side = 'left',

  children,
}: IProps) {
  const [_value, setValue] = useState('')
  const [_open, setOpen] = useState(true)
  const [hover, setHover] = useState(false)

  const isOpen: boolean = open !== undefined ? open : _open

  const val = value !== undefined ? value : _value

  const selectedTab = useMemo(() => getTabFromValue(val, tabs), [val, tabs])

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
    const selectedTabId = selectedTab?.tab.id ?? '' // getTabId(selectedTab.tab)

    //console.log('Selected tab', selectedTabId)

    return (
      <Tabs
        className="flex min-h-0 flex-col relative grow gap-y-2 pr-2 text-xs"
        value={selectedTabId} //selectedTab?.tab.id}
        //defaultValue={_value === "" ? `${tabs[0].name}:0`:undefined}
        onValueChange={_onValueChange}
        orientation="horizontal"
        ref={ref}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <TabIndicatorProvider>
          <UnderlineTabs value={selectedTabId} tabs={tabs}>
            {showCloseButton && (
              <CloseButton
                onClick={() => _onOpenChange(false)}
                data-hover={hover}
              />
            )}
          </UnderlineTabs>
        </TabIndicatorProvider>
        <TabContentPanels tabs={tabs} />
        {/* {selectedTab.tab.content}   */}
      </Tabs>
    )
  }, [val, tabs, hover, selectedTab])

  return (
    <SlideBar
      id={id}
      open={isOpen}
      onOpenChange={_onOpenChange}
      side={side}
      initialPosition={position}
      limits={limits}
      //mainContent={children}
      //sideContent={tabsElem}
    >
      {/* <SlideBarContent className={className} /> */}
      <>{children}</>
      <>{tabsElem}</>
    </SlideBar>
  )
}
