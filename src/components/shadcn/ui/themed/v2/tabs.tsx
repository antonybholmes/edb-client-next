import { type ITab } from '@/components/tabs/tab-provider'
import { useTabs } from '@/components/tabs/tab-store'
import type { IClassProps } from '@/interfaces/class-props'
import { cn } from '@/lib/shadcn-utils'
import { BUTTON_MD_H_CLS, FOCUS_RING_CLS } from '@/theme'
import { Tabs as TabsPrimitive } from '@base-ui/react/tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { memo } from 'react'

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
  'flex flex-row items-center rounded-theme',
  'disabled:opacity-50 hover:bg-muted/25',
  'data-active:font-semibold overflow-hidden'
)

export const TRIGGER_CLS = cn(
  FOCUS_RING_CLS,
  BUTTON_MD_H_CLS,
  BASE_TRIGGER_CLS,
  'data-active:bg-muted/50'
)

export const SIDEBAR_CLS = cn(
  BASE_TRIGGER_CLS,
  'px-3 h-8 data-active:bg-muted/60'
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

// export const BaseTabsList = forwardRef<
//   ComponentRef<typeof TabsPrimitive.List>,
//   ComponentPropsWithoutRef<typeof TabsPrimitive.List>
// >(({ className, ...props }, ref) => (
//   <TabsPrimitive.List
//     id="tabs-list"
//     ref={ref}
//     className={cn(
//       'flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
//       className
//     )}
//     {...props}
//   />
// ))
// BaseTabsList.displayName = 'BaseTabsList' //TabsPrimitive.List.displayName

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

// export const BaseTabsTrigger = forwardRef<
//   ComponentRef<typeof TabsPrimitive.Trigger>,
//   IBaseTabsTrigger
// >(({ selected = false, className, ...props }, ref) => (
//   <TabsPrimitive.Trigger
//     ref={ref}
//     className={className}
//     data-checked={selected}
//     {...props}
//   />
// ))
// BaseTabsTrigger.displayName = 'BaseTabsTrigger' //TabsPrimitive.Trigger.displayName

const triggerVariants = cva('relative', {
  variants: {
    variant: {
      base: FOCUS_RING_CLS,
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
      className={cn('outline-none grow flex', className)}
      {...props}
    />
  )
}

export const TabContentPanel = memo(function TabContentPanel({
  tabIndex,
  tabs,
}: IClassProps & {
  tabIndex: number
  tabs: ITab[]
}) {
  // change default if it does match a tab id

  //const { tabIndex } = useTabs(groupId)

  // if (!selectedTab) {
  //   return null
  // }

  const selectedTab = tabs[tabIndex] //getTabFromValue(value, tabs)

  if (!selectedTab) {
    return null
  }

  // return (
  //   <BaseCol className="h-full grow overflow-hidden">
  //     {selectedTab.content}
  //   </BaseCol>
  // )

  return selectedTab.content
})

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

interface ITabContentPanelsProps extends IClassProps {
  groupId: string
  tabs: ITab[]
}

export function TabContentPanels({
  groupId,
  tabs,
  className,
}: ITabContentPanelsProps) {
  const { tab: selectedTab } = useTabs(groupId)

  // set the first tab as default on mount
  // useEffect(() => {
  //   setTab({ id: tabs[0]?.id ?? '', index: 0 })
  // }, [tabs.map(tab => tab.id).join('|'), selectedTab?.id])

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={() => {}}
      id={groupId}
      className={className}
    >
      {tabs.map((tab, ti) => (
        <TabsContent value={tab.id} key={ti} className="grow h-full">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

// export function TabContentForceMountPanels({
//   groupId,
//   tabs,
// }: ITabContentPanelsProps) {
//   const { tab: selectedTab } = useTabs(groupId)

//   return tabs.map((tab, ti) => (
//     <Activity mode={ti == selectedTab?.index ? 'visible' : 'hidden'} key={ti}>
//       {tab.content}
//     </Activity>
//   ))
// }
