import { VCenterRow } from '@/components/layout/v-center-row'
import { Tabs } from '@components/shadcn/ui/themed/tabs'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import type { TabsProps } from '@radix-ui/react-tabs'
import { forwardRef, useMemo, type ForwardedRef, type ReactNode } from 'react'
import { ToolbarIconButton } from './toolbar-icon-button'
import { ToolbarTabGroup } from './toolbar-tab-group'

import {
  FileDropPanel,
  type IFileDropProps,
} from '@/components/file-drop-panel'
import { DRAG_OUTLINE_CLS } from '@/theme'
import { cn } from '@lib/class-names'
import { getTabFromValue, type ITab, type ITabProvider } from '../tab-provider'
import { ReorderTabs, type ITabReorder } from './reorder-tabs'
import { UnderlineTabs, type ITabMenu } from './underline-tabs'

// const LINE_CLS =
//   "tab-line absolute bottom-0 left-0 block h-0.5 bg-theme"

interface IProps
  extends TabsProps,
    ITabProvider,
    IFileDropProps,
    ITabMenu,
    ITabReorder {
  maxNameLength?: number
  padding?: number
  scale?: number
  buttonClassName?: string
  rightContent?: ReactNode
  allowReorder?: boolean
}

export const BottomBar = forwardRef(function BottomBar(
  {
    tabs,
    value,
    onValueChange,
    onTabChange,
    maxNameLength = 10,
    rightContent,
    onFileDrop = undefined,
    allowReorder = false,
    className,
    style,
    onReorder = () => {},
    menuCallback = () => {},
    menuActions = [],
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  if (!selectedTab) {
    return null
  }

  const selectedTabId = selectedTab.tab.id //getTabId(selectedTab.tab)

  //const _tabValue = getTabValue(value ?? _value, tabs)

  function _onValueChange(value: string) {
    //const [name, index] = parseTabId(value)
    const selectedTab = getTabFromValue(value, tabs)

    if (selectedTab?.tab.id) {
      onValueChange?.(selectedTab?.tab.id)
    }

    if (selectedTab) {
      onTabChange?.(selectedTab)
    }
    //onTabIdChange?.(value)
  }

  let content: ReactNode = selectedTab.tab.content

  // if drop enabled, wrap the content so we can drag over
  if (onFileDrop) {
    content = <FileDropPanel onFileDrop={onFileDrop}>{content}</FileDropPanel>
  }

  return (
    <Tabs
      ref={ref}
      value={selectedTabId}
      onValueChange={_onValueChange}
      className={cn('flex grow flex-col', DRAG_OUTLINE_CLS, className)}
      style={style}
    >
      {content}
      <VCenterRow className="shrink-0 justify-between text-xs">
        <VCenterRow className="gap-x-1">
          <ToolbarTabGroup className="stroke-foreground">
            <ToolbarIconButton
              title="Previous tab"
              variant="accent"
              size="icon-sm"
              pad="none"
              onClick={() => {
                const selectedTabIndex = tabs
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
              <ChevronRightIcon w="w-4" className="-scale-x-100" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Next tab"
              variant="accent"
              size="icon-sm"
              pad="none"
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
              <ChevronRightIcon w="w-4" />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          {allowReorder ? (
            <ReorderTabs
              value={selectedTabId}
              tabs={tabs}
              maxNameLength={maxNameLength}
              variant="sheet"
              menuCallback={menuCallback}
              menuActions={menuActions}
              onReorder={onReorder}
            />
          ) : (
            <UnderlineTabs
              value={selectedTabId}
              tabs={tabs}
              maxNameLength={maxNameLength}
              variant="sheet"
              menuCallback={menuCallback}
              menuActions={menuActions}
            />
          )}
        </VCenterRow>
        {rightContent}
      </VCenterRow>
    </Tabs>
  )
})
