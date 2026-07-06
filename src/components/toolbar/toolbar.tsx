import { BaseRow } from '@/layout/base-row'

import { type IDivProps } from '@/interfaces/div-props'
import { type IOpenChange } from '@/interfaces/open-change'
import { cn } from '@/lib/shadcn-utils'

import { useState, type ComponentProps, type ReactNode } from 'react'
import { FileMenu } from './file-menu'

import { type IAppInfo } from '@/lib/app-info'

import type { TabsProps } from '@radix-ui/react-tabs'

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'
import { SplitIcon } from '@/icons/split-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { Button } from '@/themed/v2/button'

import { produce } from 'immer'

import { useEdbSettings } from '@/components/edb/edb-settings'

import { SidebarCloseIcon, SidebarOpenIcon } from 'lucide-react'
import { BaseCol } from '../layout/base-col'
import { IconButton } from '../shadcn/ui/themed/icon-button'
import { TabContentPanels } from '../shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '../tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '../tabs/tab-indicator-selected-h'

import { ITab, TOOLBAR_TABS } from '../tabs/tab-provider'
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
  name = 'Sidebar',
  show = false,
  onClick = () => {},
}: ComponentProps<typeof DropdownMenuItem> & {
  show?: boolean
  name?: string
}) {
  //const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DropdownMenuItem ref={ref} onClick={onClick}>
      {show ? (
        <SidebarCloseIcon
          strokeWidth={1.5}
          size={20}
          className="-scale-x-100"
        />
      ) : (
        <SidebarOpenIcon strokeWidth={1.5} size={20} className="-scale-x-100" />
      )}

      <span>{show ? `Hide ${name}` : `Show ${name}`}</span>
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
  groupId?: string

  fileMenuTabs?: ITab[]
  info?: IAppInfo
  leftShortcuts?: ReactNode
  rightShortcuts?: ReactNode
  fileMenuShortcuts?: ReactNode
  extMenus?: Record<string, ReactNode>
}

export function ToolbarMenu({
  groupId = TOOLBAR_TABS,
  open = false,
  onOpenChange = () => {},
  fileMenuTabs = [],
  fileMenuShortcuts,
  leftShortcuts,
  rightShortcuts,
  extMenus = {},
  className,
}: IToolbarMenuProps) {
  return (
    <VCenterRow className={cn('shrink-0 text-xs px-1.5 gap-x-1', className)}>
      {leftShortcuts && (
        <VCenterRow id="toolbar-left-shortcuts">{leftShortcuts}</VCenterRow>
      )}

      <VCenterRow className="shrink-0 grow gap-x-2" id="file-toolbar-menu">
        <FileMenu
          open={open}
          onOpenChange={onOpenChange}
          tabs={fileMenuTabs}
          extMenus={extMenus}
        />

        <UnderlineTabs
          groupId={groupId}
          tabListCls="gap-x-3"
          //tabButtonProps={{ variant: TOOLBAR_TABS }}
        >
          <TabIndicatorFollowH  />
          <TabIndicatorSelectedH   />
        </UnderlineTabs>

        {fileMenuShortcuts && (
          <VCenterRow
            id="file-menu-shortcuts"
            className="hidden sm:flex gap-x-1"
          >
            {fileMenuShortcuts}
          </VCenterRow>
        )}
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
  groupId?: string

  tabShortcutMenu?: ReactNode
}

export function ToolbarTabContentPanel({
  groupId = TOOLBAR_TABS,
}: IToolbarPanelProps) {
  // change default if it does match a tab id

  const { settings } = useEdbSettings()

  //const { tabIndex } = useTabs(groupId)

  return (
    <TabContentPanels
      id="ribbon"
      data-ribbon={settings.toolbars.ribbon.style}
      groupId={groupId}
      className="group"
      contentCls="gap-x-1"
    />
  )
}

const TAB_CONTENT_PANEL_CLS = cn(
  'text-xs bg-background shadow-md border border-border/25 rounded-lg px-1.5 py-1 grow gap-x-2 justify-between'
  //'group-data-[ribbon=single]:min-h-11',
  //'group-data-[ribbon=single]:group-data-[show-labels=show]:min-h-15',
  //'group-data-[ribbon=classic]:min-h-18',
  //'group-data-[ribbon=classic]:group-data-[show-labels=auto]:min-h-24',
  //'group-data-[ribbon=classic]:group-data-[show-labels=show]:min-h-24'
)

export function ToolbarPanel({
  groupId = TOOLBAR_TABS,
  tabShortcutMenu,
}: IToolbarPanelProps) {
  const { settings, updateSettings } = useEdbSettings()

  const [showDropdown, setShowDropdown] = useState(false)

  // useEffect(() => {
  //   setTab({ id: tabs[0]!.id ?? '', index: 0 })
  // }, []) //tabs.map(tab => tab.id).join('|'), setTab])

  return (
    <BaseRow
      className="group items-end gap-x-2 px-1.5"
      data-ribbon={settings.toolbars.ribbon.style}
      data-show-labels={settings.toolbars.groups.labels.mode}
    >
      <BaseRow className={TAB_CONTENT_PANEL_CLS}>
        <ToolbarTabContentPanel groupId={groupId} />

        <BaseCol className="justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <ToolbarIconButton title="More Options" size="icon-sm">
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
                    const newSettings = produce(settings, (draft) => {
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
                    const newSettings = produce(settings, (draft) => {
                      draft.toolbars.ribbon.style = 'single'
                    })

                    updateSettings(newSettings)
                  }}
                >
                  Single Line
                </DropdownMenuCheckboxItem>
              </DropdownMenuGroup>
              <MenuSeparator />

              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent side="right">
                    <DropdownMenuCheckboxItem
                      checked={settings.toolbars.groups.labels.mode === 'auto'}
                      onCheckedChange={() => {
                        const newSettings = produce(settings, (draft) => {
                          draft.toolbars.groups.labels.mode = 'auto'
                        })

                        updateSettings(newSettings)
                      }}
                    >
                      Auto
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                      checked={settings.toolbars.groups.labels.mode === 'show'}
                      onCheckedChange={() => {
                        const newSettings = produce(settings, (draft) => {
                          draft.toolbars.groups.labels.mode = 'show'
                        })

                        updateSettings(newSettings)
                      }}
                    >
                      Show
                    </DropdownMenuCheckboxItem>

                    <DropdownMenuCheckboxItem
                      checked={settings.toolbars.groups.labels.mode === 'hide'}
                      onCheckedChange={() => {
                        const newSettings = produce(settings, (draft) => {
                          draft.toolbars.groups.labels.mode = 'hide'
                        })

                        updateSettings(newSettings)
                      }}
                    >
                      Hide
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </BaseCol>
      </BaseRow>
      {tabShortcutMenu && (
        <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
          <DropdownMenuTrigger
            render={
              <IconButton
                variant="flat"
                size="icon-sm"
                // ripple={false}
                title="Show Pane"
                checked={showDropdown}
              >
                <ChevronRightIcon className="rotate-90" size="w-4" />
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

export function Toolbar({ className, children }: IDivProps) {
  return <BaseCol className={cn('gap-y-1', className)}>{children}</BaseCol>
}
