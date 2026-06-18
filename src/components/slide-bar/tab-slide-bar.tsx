import { useEffect } from 'react'

import { TabContentPanels } from '../shadcn/ui/themed/v2/tabs'

import { type ITabProvider } from '../tabs/tab-provider'

import { TabIndicatorFollowBlock } from '../tabs/tab-indicator-follow-block'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'
import { useTabs } from '../tabs/tab-store'
import { getSelectedMouseOverSize, UnderlineTabs } from '../tabs/underline-tabs'
import {
  OPTS_SIDEBAR_ID,
  ResizableSidebar,
  ResizableSidebarHeaderPortal,
  useResizableSidebarContext,
} from './resizable-sidebar'
import { type ISlideBarProps } from './slide-bar'

interface IProps extends ITabProvider, ISlideBarProps {
  showCloseButton?: boolean
  limits?: [number, number]
  display?: 'block' | 'flex'
}

function SideBar({ tabs }: ITabProvider) {
  const { id } = useResizableSidebarContext() // Assuming useResizableSidebar is a hook to get the id of the ResizableSidebar
  return (
    <>
      <ResizableSidebarHeaderPortal>
        <UnderlineTabs
          groupId={id}
          tabs={tabs}
          selectedMouseOverSize={getSelectedMouseOverSize}
          tabButtonProps={{ variant: 'default' }}
          //onTabChange={onTabChange}
          //tabListCls="gap-x-0.5"
          className="text-xs"
        >
          <TabIndicatorFollowBlock
            groupId={id}
            rounded={false}
            //color="bg-background"
          />
          <TabIndicatorSelectedH groupId={id} />
        </UnderlineTabs>
      </ResizableSidebarHeaderPortal>

      <TabContentPanels tabs={tabs} groupId={id} className="flex-col grow" />
    </>
  )
}

export function TabSlideBar({
  id = OPTS_SIDEBAR_ID,
  tabs,
  //showCloseButton = true,
  //onTabChange,
  side = 'left',
  children,
}: IProps) {
  //const [ , setHover] = useState(false)

  const { setTab } = useTabs(id)

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

  //function _onOpenChange(state: boolean) {
  //setOpen(state)
  //}

  return (
    <ResizableSidebar id={id} side={side}>
      <>{children}</>

      <SideBar tabs={tabs} />

      {/* <BaseCol className="gap-y-4 grow overflow-x-hidden">
        <UnderlineTabs
          groupId={id}
          tabs={tabs}
          selectedMouseOverSize={getSelectedMouseOverSize}
          tabButtonProps={{ variant: 'default' }}
          onTabChange={onTabChange}
          //tabListCls="gap-x-0.5"
        >
          <TabIndicatorFollowBlock
            groupId={id}
            rounded={false}
            //color="bg-background"
          />
          <TabIndicatorSelectedH groupId={id} />
        </UnderlineTabs>

    
        <TabContentPanels tabs={tabs} groupId={id} className="flex-col grow" />
      </BaseCol> */}

      {/* <TabContentForceMountPanels tabs={tabs} /> */}
    </ResizableSidebar>
  )
}
