import { BaseRow } from '@/layout/base-row'

import { type IDivProps } from '@/interfaces/div-props'
import { type IOpenChange } from '@/interfaces/open-change'
import { cn } from '@/lib/shadcn-utils'

import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { FileMenu } from './file-menu'

import { NO_MODULE_INFO, type IModuleInfo } from '@/lib/module-info'

import type { IChildrenProps } from '@/interfaces/children-props'
import type { TabsProps } from '@radix-ui/react-tabs'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { SplitIcon } from '@/icons/split-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { Button } from '@/themed/v2/button'

import { produce } from 'immer'

import { useEdbSettings } from '@/lib/edb/edb-settings'
import { SidebarCloseIcon } from '../icons/side-bar-close-icon'
import { SidebarOpenIcon } from '../icons/side-bar-open-icon'
import { BaseCol } from '../layout/base-col'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import { TabContentPanels } from '../shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '../tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'
import { type ITab, type ITabProvider } from '../tabs/tab-provider'
import { useTabs } from '../tabs/tab-store'
import { UnderlineTabs } from '../tabs/underline-tabs'
import { ToolbarIconButton } from './toolbar-icon-button'

export const TAB_LINE_CLS = 'stroke-theme'

export const LINE_CLS = 'stroke-theme'

export function ShowOptionsButton({
  ref,
  ...props
}: ComponentProps<typeof Button>) {
  return (
    <Button
      ref={ref}
      variant="flat"
      rounded="md"
      size="icon-sm"
      // ripple={false}
      aria-label="Show options"
      name="Show options"
      {...props}
    >
      <SplitIcon />
    </Button>
  )
}

export function ShowOptionsMenu({
  ref,
  show = false,
  onClick = () => {},
}: ComponentProps<typeof DropdownMenuItem> & { show?: boolean }) {
  //const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DropdownMenuItem ref={ref} onClick={onClick}>
      {show ? <SidebarCloseIcon stroke="" /> : <SidebarOpenIcon stroke="" />}
      <span>{show ? 'Hide Pane' : 'Show Pane'}</span>
    </DropdownMenuItem>
  )
}

// interface ITabLineProps extends IClassProps {
//   w?: number
//   lineClassName?: string
// }

// export const ToolbarTabLine = forwardRef(function ToolbarTabLine(
//   { w = 2, lineClassName, className }: ITabLineProps,
//   ref: ForwardedRef<SVGLineElement>
// ) {
//   const y = w / 2
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox={`0 0 100 ${w}`}
//       className={cn(
//         `absolute h-[${w}px] w-full bottom-0 left-0 z-10`,
//         className
//       )}
//       shapeRendering={w < 3 ? 'crispEdges' : 'auto'}
//       preserveAspectRatio="none"
//     >
//       <line
//         ref={ref}
//         x1={0}
//         y1={y}
//         x2={0}
//         y2={y}
//         strokeWidth={w}
//         strokeLinecap={w > 2 ? 'round' : 'square'}
//         className={lineClassName}
//       />
//     </svg>
//   )
// })

// export const VToolbarTabLine = forwardRef(function VToolbarTabLine(
//   { w = 3, lineClassName, className }: ITabLineProps,
//   ref: ForwardedRef<SVGLineElement>
// ) {
//   const x = w / 2
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox={`0 0 ${w} 100`}
//       className={cn(`absolute w-[${w}px] h-full top-0 left-0`, className)}
//       shapeRendering={w < 3 ? 'crispEdges' : 'auto'}
//       preserveAspectRatio="none"
//     >
//       <line
//         ref={ref}
//         x1={x}
//         y1={0}
//         x2={x}
//         y2={0}
//         strokeWidth={w}
//         strokeLinecap={w > 2 ? 'round' : 'square'}
//         className={lineClassName}
//       />
//     </svg>
//   )
// })

export interface ITabDimProps {
  w: number
  x: number
  //lineW?: number
}

interface IToolbarMenuProps extends IOpenChange, TabsProps {
  groupId: string
  tabs: ITab[]
  fileMenuTabs?: ITab[]
  info?: IModuleInfo
  leftShortcuts?: ReactNode
  rightShortcuts?: ReactNode
  extMenus?: Record<string, ReactNode>
}

export function ToolbarMenu({
  groupId,
  tabs = [],
  open = false,
  onOpenChange = () => {},
  fileMenuTabs = [],
  info = NO_MODULE_INFO,
  leftShortcuts,
  rightShortcuts,
  extMenus = {},
  className,
}: IToolbarMenuProps) {
  //const { setTab } = useTabs(groupId)
  //const { selectedTab, tabs, onTabChange } = useContext(TabContext)!

  //const [_selectedTab, _setSelectedTab] = useState<ISelectedTab | null>(null)

  return (
    <VCenterRow className={cn('shrink-0 text-xs px-2 gap-x-1', className)}>
      {leftShortcuts && (
        <VCenterRow id="toolbar-left-shortcuts">{leftShortcuts}</VCenterRow>
      )}

      <VCenterRow className="shrink-0 grow gap-x-2" id="file-toolbar-menu">
        <FileMenu
          open={open}
          onOpenChange={onOpenChange}
          tabs={fileMenuTabs}
          info={info}
          extMenus={extMenus}
        />

        <UnderlineTabs
          groupId={groupId}
          tabs={tabs}
          tabListCls="gap-x-3"
          //tabButtonProps={{ variant: 'toolbar' }}
        >
          <TabIndicatorFollowH groupId={groupId} />
          <TabIndicatorSelectedH groupId={groupId} />
        </UnderlineTabs>
      </VCenterRow>

      {rightShortcuts && (
        <VCenterRow
          className="hidden sm:flex gap-x-1 gap-y-0.5 h-8"
          id="toolbar-right-shortcuts"
        >
          {rightShortcuts}
        </VCenterRow>
      )}
    </VCenterRow>
  )
}

interface IToolbarPanelProps {
  groupId: string
  tabs: ITab[]
  tabShortcutMenu?: ReactNode
}

export function ToolbarTabContentPanel({ groupId, tabs }: IToolbarPanelProps) {
  // change default if it does match a tab id

  const { settings } = useEdbSettings()

  //const { tabIndex } = useTabs(groupId)

  return (
    <BaseRow
      //value={selectedTab.tab.id}
      id="ribbon"
      className="gap-x-1 group"
      data-ribbon={settings.toolbars.ribbon.style}
    >
      {/* {selectedTab.content} */}

      {/* <TabContentForceMountPanels tabId={tabId} tabs={tabs} /> */}
      <TabContentPanels groupId={groupId} tabs={tabs} />

      {/* <TabContentPanel tabIndex={tabIndex ?? 0} tabs={tabs} /> */}
    </BaseRow>
  )
}

export function ToolbarPanel({
  groupId,
  tabs,
  tabShortcutMenu,
}: IToolbarPanelProps) {
  // change default if it does match a tab id

  const { setTab } = useTabs(groupId)

  const { settings, updateSettings } = useEdbSettings()

  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    setTab({ id: tabs[0]!.id ?? '', index: 0 })
  }, []) //tabs.map(tab => tab.id).join('|'), setTab])

  return (
    <BaseRow className="items-end gap-x-2 px-2">
      <VCenterRow className="text-xs bg-background shadow-md rounded-xl p-1.25 grow gap-x-2 justify-between items-end">
        <ToolbarTabContentPanel groupId={groupId} tabs={tabs} />

        {/* <TabContentForceMountPanels
          groupId={groupId}
          tabs={tabs}
          className="flex-row gap-x-1 group"
        /> */}

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <ToolbarIconButton title="More Options" size="icon-xs">
                <ChevronRightIcon className="rotate-90" />
              </ToolbarIconButton>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Ribbon Style</DropdownMenuLabel>
              <DropdownMenuCheckboxItem
                checked={settings.toolbars.ribbon.style === 'classic'}
                onCheckedChange={() => {
                  const newSettings = produce(settings, draft => {
                    draft.toolbars.ribbon.style = 'classic'
                  })

                  updateSettings(newSettings)
                }}
              >
                Classic
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={settings.toolbars.ribbon.style === 'single'}
                onCheckedChange={() => {
                  const newSettings = produce(settings, draft => {
                    draft.toolbars.ribbon.style = 'single'
                  })

                  updateSettings(newSettings)
                }}
              >
                Single Line
              </DropdownMenuCheckboxItem>

              <MenuSeparator />

              <DropdownMenuCheckboxItem
                checked={settings.toolbars.groups.labels.show}
                onCheckedChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.toolbars.groups.labels.show = v
                  })

                  updateSettings(newSettings)
                }}
              >
                {/* <LabelIcon stroke="" /> */}
                Show Labels
              </DropdownMenuCheckboxItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </VCenterRow>
      {tabShortcutMenu && (
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger
            render={
              <IconButton
                variant="flat"
                size="icon-xs"
                // ripple={false}
                title="Show Pane"
                checked={showDropdown}
              >
                <ChevronRightIcon className="rotate-90" w="w-4" />
              </IconButton>
            }
          />

          <DropdownMenuContent align="end">
            {tabShortcutMenu}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </BaseRow>
  )
}

export interface IToolbarProps extends ITabProvider, IChildrenProps {}

export function Toolbar({ className, children }: IDivProps) {
  //const [selectedTab, setSelectedTab] = useState<ITab | null>(null)
  //const [focus, setFocus] = useState(false)
  //const [hover, setHover] = useState(false)
  //const initial = useRef(true)

  //const lineRef1 = useRef<SVGLineElement>(null)

  // const buttonsRef = useRef<HTMLButtonElement[]>([])
  // const itemsRef = useRef<HTMLSpanElement[]>([])
  // const tabListRef = useRef<HTMLDivElement>(null)

  // const [tabPos, setTabPos] = useState<ITabPos>({
  //   x: 0,
  //   width: 0,
  //   //transform: `scaleX(1)`,
  // })

  // useEffect(() => {
  //   const selectedTab = getTabFromValue(value, tabs)

  //   if (selectedTab) {
  //     setSelectedTab(selectedTab.tab)
  //   }
  // }, [value, tabs])

  // function _onValueChange(value: string) {
  //   const selectedTab = getTabFromValue(value, tabs)
  //   //const [name, index] = parseTabId(value)

  //   //onValueChange?.(name)
  //   if (selectedTab) {
  //     onTabChange?.(selectedTab)
  //     setSelectedTab(selectedTab.tab)
  //   }
  // }

  return <BaseCol className={cn('gap-y-1', className)}>{children}</BaseCol>
}
