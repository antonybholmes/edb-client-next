import { BaseRow } from '@/components/layout/base-row'

import { type IElementProps } from '@interfaces/element-props'
import { type IOpenChange } from '@interfaces/open-change'
import { cn } from '@lib/class-names'

import {
  forwardRef,
  useContext,
  type ForwardedRef,
  type ReactNode,
} from 'react'
import { FileMenu } from './file-menu'

import { Tabs } from '@components/shadcn/ui/themed/tabs'
import { NO_MODULE_INFO, type IModuleInfo } from '@interfaces/module-info'

import type { IChildrenProps } from '@interfaces/children-props'
import type { TabsProps } from '@radix-ui/react-tabs'

import { VCenterRow } from '@/components/layout/v-center-row'
import { ChevronRightIcon } from '@components/icons/chevron-right-icon'
import { SplitIcon } from '@components/icons/split-icon'
import { Button } from '@components/shadcn/ui/themed/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/shadcn/ui/themed/dropdown-menu'

import { BaseCol } from '@/components/layout/base-col'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { type IButtonProps } from '@components/shadcn/ui/themed/button'
import { produce } from 'immer'

import { EllipsisIcon } from '../icons/ellipsis-icon'
import { SidebarCloseIcon } from '../icons/side-bar-close-icon'
import { SidebarOpenIcon } from '../icons/side-bar-open-icon'
import {
  getTabFromValue,
  TabContext,
  TabProvider,
  type ITab,
  type ITabProvider,
} from '../tab-provider'
import { ToolbarIconButton } from './toolbar-icon-button'
import { UnderlineTabs } from './underline-tabs'

export const TAB_LINE_CLS = 'stroke-theme'

export const LINE_CLS = 'stroke-theme'

export const ShowOptionsButton = forwardRef(function ShowOptionsButton(
  { ...props }: IButtonProps,
  ref: ForwardedRef<HTMLButtonElement>
) {
  return (
    <Button
      ref={ref}
      variant="muted"
      rounded="md"
      size="icon-sm"
      pad="sm"
      ripple={false}
      aria-label="Show options"
      name="Show options"
      {...props}
    >
      <SplitIcon />
    </Button>
  )
})

export const ShowOptionsMenu = forwardRef(function ShowOptionsMenu(
  { show = false, onClick }: IElementProps & { show?: boolean },
  ref: ForwardedRef<HTMLDivElement>
) {
  //const [menuOpen, setMenuOpen] = useState(false)

  return (
    <DropdownMenuItem ref={ref} onClick={onClick}>
      {show ? <SidebarCloseIcon stroke="" /> : <SidebarOpenIcon stroke="" />}
      <span>{show ? 'Hide' : 'Show'} sidebar</span>
    </DropdownMenuItem>
  )
})

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
  fileMenuTabs?: ITab[]
  info?: IModuleInfo
  leftShortcuts?: ReactNode
  rightShortcuts?: ReactNode
  //tabShortcutMenu?: ReactNode
}

export function ToolbarMenu({
  open = false,
  onOpenChange = () => {},

  fileMenuTabs = [],

  info = NO_MODULE_INFO,
  leftShortcuts,
  rightShortcuts,
  //tabShortcutMenu,

  className,
}: IToolbarMenuProps) {
  // change default if it does match a tab id

  //const [scale, setScale] = useState(0)
  //const [focus, setFocus] = useState(false)
  //const [hover, setHover] = useState(false)
  //const initial = useRef(true)

  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  //const lineRef1 = useRef<SVGLineElement>(null)

  // const buttonsRef = useRef<HTMLButtonElement[]>([])
  // const itemsRef = useRef<HTMLSpanElement[]>([])
  // const tabListRef = useRef<HTMLDivElement>(null)

  // const [tabPos, setTabPos] = useState<ITabPos>({
  //   x: 0,
  //   width: 0,
  //   //transform: `scaleX(1)`,
  // })

  function _onValueChange(value: string) {
    const selectedTab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (selectedTab) {
      onTabChange?.(selectedTab)
    }
  }

  // useEffect(() => {
  //   const selectedTabIndex = selectedTab.index

  //   //const button = buttonsRef.current[selectedTabIndex]!
  //   //const tabElem = itemsRef.current[selectedTabIndex]!

  //   //const buttonRect = button.getBoundingClientRect()
  //   const containerRect = tabListRef.current!.getBoundingClientRect()
  //   //const tabRect = tabElem.getBoundingClientRect()

  //   const clientRect =
  //     scale > 1
  //       ? buttonsRef.current[selectedTabIndex]!.getBoundingClientRect()
  //       : itemsRef.current[selectedTabIndex]!.getBoundingClientRect()

  //   setTabPos({
  //     x: clientRect.left - containerRect.left,
  //     width: clientRect.width,

  //   })
  // }, [selectedTab, scale])

  const selectedTabId = selectedTab.tab.id //getTabId(selectedTab.tab)

  return (
    <Tabs
      id="toolbar-menu-container"
      value={selectedTabId}
      //defaultValue={_value === "" ? `${tabs[0].name}:0`:undefined}
      onValueChange={_onValueChange}
      className={cn(
        'flex shrink-0 flex-row items-center text-xs grow px-2 gap-x-1 h-9',
        className
      )}
    >
      {leftShortcuts && (
        <VCenterRow id="toolbar-left-shortcuts h-8">{leftShortcuts}</VCenterRow>
      )}

      <VCenterRow className="shrink-0 grow h-8" id="file-toolbar-menu">
        <FileMenu
          open={open}
          onOpenChange={onOpenChange}
          tabs={fileMenuTabs}
          info={info}
        />
        <UnderlineTabs tabs={tabs} value={selectedTabId} />
        {/* <BaseTabsList
          id="toolbar-menu"
          className="relative flex flex-row items-center h-full"
          ref={tabListRef}
 
        >
          {tabs.map((tab, ti) => {
            //const id = makeTabId(tab, ti)
            const tabId = tab.id //getTabId(tab)
            const selected = tabId === selectedTabId
            return (
              <BaseTabsTrigger value={tabId} key={`tab-button-${ti}`} asChild>
                <ToolbarTabButton
                 
                  className="justify-center"
   
                  aria-label={`Show ${tab.id} menu`}
                  // @ts-ignore
                  ref={el => (buttonsRef.current[ti] = el!)}
                  onMouseEnter={() => {
                    if (selected) {
                      setScale(2)
                    }
                  }}
                  onMouseLeave={() => {
                    if (selected) {
                      setScale(1)
                    }
                  }}
                  onMouseDown={() => {
                    setScale(2)
                  }}
                >
                  <span
                    data-selected={selected}
                    ref={el => (itemsRef.current[ti] = el!)}
                    aria-label={tab.id}
                    className="boldable-text-tab group-hover:font-semibold data-[selected=true]:font-semibold data-[selected=true]:text-theme"
                  >
                    {tab.id}
                  </span>
                </ToolbarTabButton>
              </BaseTabsTrigger>
            )
          })}

 
          <ToolbarTabLine tabPos={tabPos} />
        </BaseTabsList> */}
      </VCenterRow>

      {rightShortcuts && (
        <VCenterRow
          className="hidden sm:flex gap-y-0.5 h-8"
          id="toolbar-right-shortcuts"
        >
          {rightShortcuts}
        </VCenterRow>
      )}
    </Tabs>
  )
}

interface IToolbarPanelProps {
  tabShortcutMenu?: ReactNode
}

export function ToolbarPanel({ tabShortcutMenu }: IToolbarPanelProps) {
  // change default if it does match a tab id

  const { selectedTab } = useContext(TabContext)!

  const { settings, updateSettings } = useContext(EdbSettingsContext)

  if (!selectedTab) {
    return null
  }

  return (
    <BaseRow className="items-end gap-x-2 px-2">
      <VCenterRow className="text-xs bg-background shadow-md rounded-lg px-1.5 py-1 grow gap-x-2 justify-between">
        <VCenterRow className="gap-x-2">
          {selectedTab && selectedTab.tab.content}
        </VCenterRow>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <ToolbarIconButton>
              <EllipsisIcon />
            </ToolbarIconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={settings.toolbars.groups.labels.show}
              onCheckedChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.toolbars.groups.labels.show = v
                })

                updateSettings(newSettings)
              }}
            >
              Show group labels
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </VCenterRow>
      {tabShortcutMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="accent"
              size="icon-xs"
              pad="none"
              ripple={false}
              title="Sidebar options"
            >
              <ChevronRightIcon className="rotate-90" w="w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {tabShortcutMenu}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </BaseRow>
  )
}

// interface IToolbarContentProps extends IChildrenProps {
//   gap?:string
// }

// export function ToolbarContent({
//   gap = "gap-y-1",
//   className,
//   children,
// }: IToolbarContentProps) {
//   return <BaseCol className={cn("shrink-0", gap, className)}>{children}</BaseCol>
// }

export interface IToolbarProps extends ITabProvider, IChildrenProps {}

export function Toolbar({
  value,
  onTabChange = () => {},
  tabs,
  children,
  className,
}: IToolbarProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <BaseCol className={cn('shrink-0 mb-2', className)}>{children}</BaseCol>
    </TabProvider>
  )
}
