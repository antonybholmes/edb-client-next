import { useEffect, useState } from 'react'

import { TabContentPanels } from '../shadcn/ui/themed/v2/tabs'

import { type ITabProvider } from '../tabs/tab-provider'

import { useStableId } from '@/hooks/stable-id'
import { BaseCol } from '../layout/base-col'
import { VCenterRow } from '../layout/v-center-row'
import { TabIndicatorFollowBlock } from '../tabs/tab-indicator-follow-block'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'
import { useTabs } from '../tabs/tab-store'
import { getSelectedMouseOverSize, UnderlineTabs } from '../tabs/underline-tabs'
import { ResizableSidebar } from './resizable-sidebar'
import { CloseButton, type ISlideBarProps } from './slide-bar'
import { useSlideBar } from './slide-bar-store'

interface IProps extends ITabProvider, ISlideBarProps {
  showCloseButton?: boolean
  limits?: [number, number]
  display?: 'block' | 'flex'
}

export function TabSlideBar({
  id,
  tabs,
  showCloseButton = true,
  onTabChange,
  side = 'left',
  children,
}: IProps) {
  const [hover, setHover] = useState(false)

  const _id = id ?? useStableId('tab-slide-bar')

  const { setOpen } = useSlideBar(_id)

  const { setTab } = useTabs(_id)

  // set default tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      return
    }
    setTab({ id: tabs[0]!.id, index: 0 })
  }, [])

  //const isOpen: boolean = open !== undefined ? open : _open

  //const val = value !== undefined ? value : _value

  // useEffect(() => {
  //   setInitialSize(80)
  // }, [])

  // useEffect(() => {
  //   sendMessage({ data: open ? 'open' : 'close' })
  // }, [open])

  // useEffect(() => {
  //   if (value) {
  //     const tab = getTabFromValue(value, tabs)
  //     if (tab) {
  //       setTab({ id: tab.tab.id, index: tab.index })
  //     }
  //   }
  // }, [value])

  function _onOpenChange(state: boolean) {
    setOpen(state)
  }

  return (
    <ResizableSidebar id={_id} side={side}>
      <>{children}</>
      <BaseCol className="gap-y-4 grow overflow-x-hidden">
        <VCenterRow
          className="justify-between px-1 text-xs"
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          <UnderlineTabs
            groupId={_id}
            tabs={tabs}
            selectedMouseOverSize={getSelectedMouseOverSize}
            tabButtonProps={{ variant: 'default' }}
            onTabChange={onTabChange}
            //tabListCls="gap-x-0.5"
          >
            <TabIndicatorFollowBlock
              groupId={_id}
              rounded={false}
              //color="bg-background"
            />
            <TabIndicatorSelectedH groupId={_id} />
          </UnderlineTabs>

          {showCloseButton && (
            <CloseButton
              onClick={() => _onOpenChange(false)}
              data-hover={hover}
            />
          )}
        </VCenterRow>

        {/* <TabContentPanel tabIndex={tabIndex ?? 0} tabs={tabs} /> */}

        <TabContentPanels tabs={tabs} groupId={_id} className="flex-col grow" />
      </BaseCol>

      {/* <TabContentForceMountPanels tabs={tabs} /> */}
    </ResizableSidebar>
  )
}
