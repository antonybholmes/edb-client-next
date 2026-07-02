import { BaseCol } from '../layout/base-col'
import { TabContentPanels } from '../shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowBlock } from '../tabs/tab-indicator-follow-block'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'
import { OPTS_SIDEBAR_ID } from '../tabs/tab-provider'

import { getSelectedMouseOverSize, UnderlineTabs } from '../tabs/underline-tabs'
import {
  ResizableSidebar,
  useResizableSidebarContext,
} from './resizable-sidebar'
import { type ISlideBarProps } from './slide-bar'

interface IProps extends ISlideBarProps {
  showCloseButton?: boolean
  limits?: [number, number]
  display?: 'block' | 'flex'
}

export function SideBarTabs() {
  const { id } = useResizableSidebarContext() // Assuming useResizableSidebar is a hook to get the id of the ResizableSidebar

  return (
    <BaseCol className="gap-y-2 h-full grow">
      {/* <ResizableSidebarHeaderPortal> */}
      <UnderlineTabs
        groupId={id}
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
      {/* </ResizableSidebarHeaderPortal> */}

      <TabContentPanels groupId={id} className="grow" />
    </BaseCol>
  )
}

export function TabSlideBar({
  id = OPTS_SIDEBAR_ID,

  //showCloseButton = true,
  //onTabChange,
  side = 'left',
  children,
}: IProps) {
  //const [ , setHover] = useState(false)

  // set default tab on mount
  // useEffect(() => {
  //   if (tabs.length === 0) {
  //     return
  //   }
  //   setTab({ id: tabs[0]!.id, index: 0 })
  // }, [])

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

      <SideBarTabs />

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
