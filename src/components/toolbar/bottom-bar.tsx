import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { type ReactNode } from 'react'
import { ToolbarIconButton } from './toolbar-icon-button'

import { type IFileDropProps } from '@/components/file-drop-panel'
import { IClassProps } from '@/interfaces/class-props'
import { Select as SelectPrimitive } from '@base-ui/react/select'
import { FileDropZonePanel } from '../file-dropzone-panel'
import { HamburgerIcon } from '../icons/hamburger-icon'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import {
  Select,
  SelectContent,
  SelectItem,
} from '../shadcn/ui/themed/v2/select'
import { ReorderTabs } from '../tabs/reorder-tabs'
import { getTabName, useTabs } from '../tabs/tab-provider'
import { type ITabMenu } from '../tabs/underline-tabs'
// const LINE_CLS =
//   "tab-line absolute bottom-0 left-0 block h-0.5 bg-theme"

interface IBottomBarProps extends IFileDropProps, ITabMenu, IClassProps {
  groupId?: string
  maxNameLength?: number
  padding?: number
  scale?: number
  buttonClassName?: string
  rightContent?: ReactNode
  allowReorder?: boolean
}

export function BottomBar({
  groupId = 'bottom-bar',

  maxNameLength = 16,
  rightContent,
  onFileDrop = undefined,
  allowReorder = false,
  className,
  style = {},
  //onReorder = () => {},
  menuCallback = () => {},
  menuActions = [],
}: IBottomBarProps) {
  const { selectedTab, tabs, setTab } = useTabs(groupId)

  let content: ReactNode = (
    // <Tabs
    //   id="bottom-bar"

    //   className={cn(
    //     'flex grow flex-col overflow-hidden',
    //     [onFileDrop !== undefined, DRAG_OUTLINE_CLS],
    //     className
    //   )}
    //   style={style}
    // >

    <VCenterRow className="shrink-0 justify-between text-xs">
      <VCenterRow className="gap-x-2">
        <VCenterRow>
          <ToolbarIconButton
            title="Previous Sheet"
            variant="flat"
            size="icon-sm"
            //rounded="full"
            onClick={() => {
              let selectedTabIndex = tabs!
                .map((t, ti) => ({ tab: t, index: ti }))
                .filter((t) => t.tab.id === selectedTab?.id)
                .map((t) => t.index)[0]!

              selectedTabIndex =
                selectedTabIndex === 0 ? tabs.length - 1 : selectedTabIndex - 1

              setTab(tabs[selectedTabIndex]!.id)
            }}
          >
            <ChevronRightIcon size="w-4" className="-scale-x-100" />
          </ToolbarIconButton>
          <ToolbarIconButton
            title="Next Sheet"
            size="icon-sm"
            //rounded="full"
            onClick={() => {
              const selectedTabIndex = tabs
                .map((t, ti) => ({ tab: t, index: ti }))
                .filter((t) => t.tab.id === selectedTab?.id)
                .map((t) => t.index)[0]!

              const nextTabIndex = (selectedTabIndex + 1) % tabs.length
              setTab(tabs[nextTabIndex]!.id)
            }}
          >
            <ChevronRightIcon size="w-4" />
          </ToolbarIconButton>

          <Select
            value={selectedTab?.id ?? ''}
            onValueChange={(v) => {
              setTab(v ?? '')
            }}
          >
            <SelectPrimitive.Trigger
              render={
                <IconButton size="icon-sm" title="Sheet List">
                  <HamburgerIcon />
                </IconButton>
              }
            />

            <SelectContent side="top" align="start">
              {tabs.map((tab) => (
                <SelectItem key={tab.id} value={tab.id}>
                  {getTabName(tab)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </VCenterRow>

        <ReorderTabs
          groupId={groupId}
          maxNameLength={maxNameLength}
          variant="sheet"
          menuCallback={menuCallback}
          menuActions={menuActions}
          //onReorder={onReorder}
          allowReorder={allowReorder}
        />
      </VCenterRow>
      {rightContent}
    </VCenterRow>
    // </Tabs>
  )

  if (onFileDrop) {
    content = (
      <FileDropZonePanel onFileDrop={onFileDrop}>{content}</FileDropZonePanel>
    )
  }

  return content
}
