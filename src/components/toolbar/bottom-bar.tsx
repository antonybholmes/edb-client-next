import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { VCenterRow } from '@/layout/v-center-row'
import type { TabsProps } from '@radix-ui/react-tabs'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { ToolbarIconButton } from './toolbar-icon-button'

import { type IFileDropProps } from '@/components/file-drop-panel'
import { cn } from '@/lib/shadcn-utils'
import { DRAG_OUTLINE_CLS } from '@/theme'
import { FileDropZonePanel } from '../file-dropzone-panel'
import { HamburgerIcon } from '../icons/hamburger-icon'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/v2/dropdown-menu'
import { ReorderTabs, type ITabReorder } from '../tabs/reorder-tabs'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from '../tabs/tab-provider'
import { type ITabMenu } from '../tabs/underline-tabs'

// const LINE_CLS =
//   "tab-line absolute bottom-0 left-0 block h-0.5 bg-theme"

interface IBottomBarProps
  extends TabsProps, ITabProvider, IFileDropProps, ITabMenu, ITabReorder {
  maxNameLength?: number
  padding?: number
  scale?: number
  buttonClassName?: string
  rightContent?: ReactNode
  allowReorder?: boolean
}

export function BottomBar({
  tabs,
  value,
  onValueChange,
  onTabChange,
  maxNameLength = 16,
  rightContent,
  onFileDrop = undefined,
  allowReorder = false,
  className,
  style = {},
  onReorder = () => {},
  menuCallback = () => {},
  menuActions = [],
}: IBottomBarProps) {
  // fix complaints about possible nulls
  tabs = tabs ?? []

  const [mounted, setMounted] = useState(false)
  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  function _onValueChange(value: string) {
    //const [name, index] = parseTabId(value)
    const selectedTab = getTabFromValue(value, tabs!)

    if (selectedTab?.tab.id) {
      onValueChange?.(selectedTab?.tab.id)
    }

    if (selectedTab) {
      onTabChange?.(selectedTab)
    }
    //onTabIdChange?.(value)
  }

  useEffect(() => setMounted(true), [])

  if (!mounted || !selectedTab) {
    return null
  }

  const selectedTabId = selectedTab.tab.id //getTabId(selectedTab.tab)

  console.log('selectedTabId:', selectedTab)

  let content: ReactNode = (
    <Tabs
      id="bottom-bar"
      value={selectedTabId}
      onValueChange={_onValueChange}
      className={cn(
        'flex grow flex-col overflow-hidden',
        [onFileDrop !== undefined, DRAG_OUTLINE_CLS],
        className
      )}
      style={style}
    >
      {tabs.map((tab) => {
        const TabContentComponent = tab.render

        if (!TabContentComponent) {
          return null
        }

        return (
          <TabsContent value={tab.id} key={tab.id}>
            <TabContentComponent />
          </TabsContent>
        )
      })}

      <VCenterRow className="shrink-0 justify-between text-xs">
        <VCenterRow className="gap-x-2">
          <VCenterRow>
            <ToolbarIconButton
              title="Previous Sheet"
              variant="flat"
              size="icon-sm"
              //rounded="full"
              onClick={() => {
                const selectedTabIndex = tabs!
                  .map((t, ti) => [t, ti] as [ITab, number])
                  .filter((t) => t[0]!.id === selectedTab.tab.id)
                  .map((t) => t[1]!)[0]!

                const i =
                  selectedTabIndex === 0
                    ? tabs.length - 1
                    : Math.max(
                        0,
                        Math.min(tabs.length - 1, selectedTabIndex - 1)
                      )

                _onValueChange(tabs[i]!.id)
              }}
            >
              <ChevronRightIcon size="w-4" className="-scale-x-100" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Next Sheet"
              size="icon-sm"
              //rounded="full"
              onClick={() => {
                // const i: number = Math.min(
                //   tabs.length - 1,
                //   tabs
                //     .map((t, ti) => [t, ti] as [ITab, number])
                //     .filter(t => t[0]!.name === selectedTab.tab.id)
                //     .map(t => t[1]!)[0]! + 1
                // )

                const selectedTabIndex = tabs
                  .map((t, ti) => [t, ti] as [ITab, number])
                  .filter((t) => t[0]!.id === selectedTab.tab.id)
                  .map((t) => t[1]!)[0]!

                const i = Math.max(
                  0,
                  Math.min(
                    tabs.length - 1,
                    (selectedTabIndex + 1) % tabs.length
                  )
                )

                _onValueChange(tabs[i]!.id)
              }}
            >
              <ChevronRightIcon size="w-4" />
            </ToolbarIconButton>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <IconButton size="icon-sm" title="Sheet List">
                    <HamburgerIcon />
                  </IconButton>
                }
              />
              <DropdownMenuContent align="start">
                {tabs.map((tab) => (
                  <DropdownMenuCheckboxItem
                    id={tab.id}
                    key={tab.id}
                    checked={tab.id === selectedTabId}
                  >
                    {getTabName(tab)}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </VCenterRow>

          <ReorderTabs
            value={selectedTabId}
            tabs={tabs}
            maxNameLength={maxNameLength}
            variant="sheet"
            menuCallback={menuCallback}
            menuActions={menuActions}
            onReorder={onReorder}
            allowReorder={allowReorder}
          />
        </VCenterRow>
        {rightContent}
      </VCenterRow>
    </Tabs>
  )

  if (onFileDrop) {
    content = (
      <FileDropZonePanel onFileDrop={onFileDrop}>{content}</FileDropZonePanel>
    )
  }

  return content
}
