import { BUTTON_MD_H_CLS, FOCUS_RING_CLS } from '@/theme'
import type { ITab } from '@components/tabs/tab-provider'
import { cn } from '@lib/shadcn-utils'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'

import {
  forwardRef,
  type ComponentProps,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

export const TABS_CLS =
  'flex flex-row justify-center bg-muted rounded-theme text-xs relative'

export const TRIGGER_SELECTED_CLS =
  'ring-offset-background focus-visible:outline-hidden disabled:pointer-events-none'

export const TRIGGER_CLS = cn(
  BUTTON_MD_H_CLS,
  FOCUS_RING_CLS,
  'inline-flex items-center justify-center whitespace-nowrap rounded-theme px-2',
  'disabled:opacity-50 data-[state=active]:bg-background',
  'data-[state=active]:shadow-xs data-[state=active]:font-semibold overflow-hidden',
  'border border-transparent data-[state=active]:border-border/75'
)

//const CONTENT_CLS = "mt-2 ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

export const Tabs = TabsPrimitive.Root

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

const tabVariants = cva(
  'flex data-[orientation=horizontal]:flex-row data-[orientation=vertical]:flex-col',
  {
    variants: {
      variant: {
        base: '',
        default: TABS_CLS,
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export const TabsList = forwardRef<
  ComponentRef<typeof TabsPrimitive.List>,
  ComponentPropsWithoutRef<typeof TabsPrimitive.List> &
    VariantProps<typeof tabVariants>
>(({ className, id = 'tabs-list', variant = 'default', ...props }, ref) => (
  <TabsPrimitive.List
    id={id}
    ref={ref}
    className={tabVariants({
      className,
      variant,
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
      base: '',
      default: TRIGGER_CLS,
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface ITabTrigger
  extends ComponentProps<typeof TabsPrimitive.Trigger>,
    VariantProps<typeof triggerVariants> {
  selected?: boolean
}

export function TabsTrigger({
  ref,
  className,
  variant = 'default',
  selected = false,
  ...props
}: ITabTrigger) {
  return (
    <TabsPrimitive.Trigger
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
}: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      className={cn('outline-none', className)}
      {...props}
    />
  )
}

export function TabContentPanels({ tabs }: { tabs: ITab[] }) {
  return tabs.map((tab) => (
    <TabsContent value={tab.id} className="h-full overflow-hidden" key={tab.id}>
      {tab.content}
    </TabsContent>
  ))
}
