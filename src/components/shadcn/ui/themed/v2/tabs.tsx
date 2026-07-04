import { renderTab, useTabs } from '@/components/tabs/tab-provider'
import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { FOCUS_RING_CLS } from '@/theme'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

export const TABS_CLS = 'justify-center bg-muted rounded-theme text-xs relative'

export const TRIGGER_SELECTED_CLS =
  'ring-offset-background focus-visible:outline-hidden disabled:pointer-events-none'

export const BASE_TRIGGER_CLS = cn(
  FOCUS_RING_CLS,
  'flex disabled:opacity-50 hover:bg-muted/50',
  'data-active:font-medium overflow-hidden'
)

export const TRIGGER_CLS = cn(
  FOCUS_RING_CLS,
  BASE_TRIGGER_CLS,
  'flex-row h-button-md data-active:bg-muted/50 items-center'
)

export const SIDEBAR_CLS = cn(
  BASE_TRIGGER_CLS,
  'flex-row items-center px-2 h-9 data-active:bg-app-theme/15'
)

export const PLAIN_CLS = cn(
  FOCUS_RING_CLS,
  'inline-flex items-center justify-center whitespace-nowrap py-1 px-2',
  'disabled:opacity-50',
  'data-active:font-semibold overflow-hidden'
)

export const MENU_CLS = cn(
  FOCUS_RING_CLS,
  'inline-flex items-center justify-center whitespace-nowrap py-1 px-2',
  'disabled:opacity-50 data-active:bg-muted',
  'data-active:font-semibold overflow-hidden'
)

export const UNDERLINE_CLS = cn(
  FOCUS_RING_CLS,
  'inline-flex items-center justify-center whitespace-nowrap py-1 px-2',
  'disabled:opacity-50 data-active:border-theme border-b-2 border-transparent',
  'data-active:font-semibold overflow-hidden'
)

//const CONTENT_CLS = "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export function Tabs({ ...props }: ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root {...props} />
}

const tabVariants = cva('flex relative', {
  variants: {
    variant: {
      default:
        'data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
      muted: TABS_CLS,
      sidebar: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabVariants>
>(({ className, id = 'tabs-list', variant, ...props }, ref) => (
  <TabsPrimitive.List
    id={id}
    ref={ref}
    className={tabVariants({
      variant,
      className,
    })}
    {...props}
  />
))
TabsList.displayName = 'TabsList' //TabsPrimitive.List.displayName

const triggerVariants = cva('relative', {
  variants: {
    variant: {
      none: FOCUS_RING_CLS,
      base: BASE_TRIGGER_CLS,
      default: TRIGGER_CLS,
      menu: MENU_CLS,
      plain: PLAIN_CLS,
      underline: UNDERLINE_CLS,
      sidebar: SIDEBAR_CLS,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface ITabTrigger
  extends
    ComponentProps<typeof TabsPrimitive.Tab>,
    VariantProps<typeof triggerVariants> {
  selected?: boolean
}

export function TabsTrigger({
  ref,
  className,
  variant,
  hidden,
  selected = false,
  ...props
}: ITabTrigger) {
  return (
    <TabsPrimitive.Tab
      ref={ref}
      className={triggerVariants({
        className,
        variant,
      })}
      data-checked={selected}
      {...props}
    />
  )
}

export function TabsContent({
  ref,
  className,
  ...props
}: ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      ref={ref}
      className={cn('outline-none grow flex w-full   h-full', className)}
      {...props}
    />
  )
}

// export function TabContentPanel({
//   tabIndex,
//   tabs,
// }: IClassProps & {
//   tabIndex: number
//   tabs: ITab[]
// }) {
//   const selectedTab = tabs[tabIndex]

//   if (!selectedTab) {
//     return null
//   }

//   if (selectedTab.component) {
//     const TabContentComponent = selectedTab.component

//     return <TabContentComponent />
//   }

//   if (selectedTab.render) {
//     const TabContentComponent = selectedTab.render

//     return <TabContentComponent />
//   }

//   return null
// }

// interface ITabPanelProps extends IChildrenProps {
//   active: boolean
// }

// const ForceMountTabPanel = memo(function TabPanel({
//   active,
//   className,
//   children,
// }: ITabPanelProps) {
//   // to hide without unmounting make absolute and invisible
//   // which is better than display:none for performance,
//   // absolute stops it from affecting layout and invisible + pointerEvents:none
//   // makes it not interactable and not visible
//   return <Activity mode={active ? 'visible' : 'hidden'}>{children}</Activity>
// })

interface ITabContentPanelsProps extends IDivProps {
  groupId?: string
  //tabs: ITab[]
  contentCls?: string
}

/**
 * Render each ITab as a TabsContent panel, using the
 * base-ui Tabs component. This will unmount the content
 * of each tab when it is not selected.
 * Should use ITab component property to render the content of each tab
 * where it should be a component reference that can be rendered. If the component is not provided, the tab will not be rendered.
 *
 * @param param0
 * @returns
 */
export function TabContentPanels({
  groupId = 'toolbar',
  className,
  contentCls,
  ...props
}: ITabContentPanelsProps) {
  const { selectedTab, tabs } = useTabs(groupId)

  return (
    <Tabs value={selectedTab?.id ?? ''} className={className} {...props}>
      {tabs
        .filter((c) => !!c.component)
        .map((tab, ti) => {
          return (
            <TabsContent
              value={tab.id}
              key={ti}
              className={cn('h-full', contentCls)}
            >
              {renderTab(tab)}
            </TabsContent>
          )
        })}
    </Tabs>
  )
}

// export function TabContentForceMountPanels({
//   groupId = 'toolbar',
// }: ITabContentPanelsProps) {
//   const { tabs, selectedTabIndex } = useTabs(groupId)

//   return tabs
//     .filter((tab) => !!tab.component)
//     .map((tab, ti) => {
//       const TabContentComponent = tab.component!
//       return (
//         <Activity mode={ti == selectedTabIndex ? 'visible' : 'hidden'} key={ti}>
//           <TabContentComponent />
//         </Activity>
//       )
//     })
// }
