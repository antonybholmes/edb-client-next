import type { IChildrenProps } from '@interfaces/children-props'
import type { IDivProps } from '@interfaces/div-props'
import { rangeMap } from '@lib/math/range'
import { sum } from '@lib/math/sum'
import { cn } from '@lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { useContext, useEffect, useState } from 'react'
import { BaseCol } from './layout/base-col'
import type { toggleVariants } from './shadcn/ui/themed/toggle'
import { ToggleGroup, ToggleGroupItem } from './shadcn/ui/themed/toggle-group'
import {
  getTabFromValue,
  getTabName,
  TabContext,
  TabProvider,
  type ITab,
  type TabChange,
} from './tabs/tab-provider'

// const BUTTON_CLS = cn(
//   FOCUS_RING_CLS,
//   'trans-color data-[state=active]:font-medium relative justify-center items-center boldable-text-tab z-10'
// )

// const TOGGLE_VARIANT_DEFAULT_BUTTON_CLS = cn(
//   BUTTON_CLS,
//   'data-[state=inactive]:hover:bg-background/90 h-full rounded-sm'
// )

//const TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS = cn(BUTTON_CLS)

interface IToggleButtonsProps extends IChildrenProps {
  value?: string
  tabs: ITab[]
  onTabChange?: TabChange
}

export function ToggleButtons({
  value = '',
  tabs = [],
  onTabChange = () => {},
  children,
  className,
}: IToggleButtonsProps) {
  return (
    <TabProvider value={value} onTabChange={onTabChange} tabs={tabs}>
      <BaseCol className={className}>{children}</BaseCol>
    </TabProvider>
  )
}

interface IToggleButtonContentProps
  extends IDivProps,
    VariantProps<typeof toggleVariants> {
  showLabels?: boolean
  defaultWidth?: number
}

export const toggleButtonVariants = cva('relative flex flex-row', {
  variants: {
    variant: {
      default: 'rounded-theme overflow-hidden',
      outline: 'p-0.25 rounded-theme bg-muted',
      gray: '',
      colorful: '',
      tab: 'gap-x-0.5',
      group: 'rounded-theme bg-background',
    },
  },
})

export function ToggleButtonTriggers({
  showLabels = true,
  defaultWidth = 5,
  variant = 'default',
  size = 'md',
  rounded = 'none',
  className,
}: IToggleButtonContentProps) {
  const { selectedTab, onTabChange, tabs } = useContext(TabContext)!

  const [tabPos, setTabPos] = useState<{ x: string; width: string }>({
    x: '0rem',
    width: `${defaultWidth}rem`,
  })

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const x = sum(
      rangeMap(
        index => (tabs[index]?.size ?? defaultWidth) + 0.25,
        0,
        selectedTab.index
      )
    )

    //const x = 0

    const width = tabs[selectedTab.index]!.size ?? defaultWidth

    setTabPos({ x: `${x}rem`, width: `${width}rem` })
  }, [selectedTab])

  function _onValueChange(value: string) {
    // one toggle must always be active
    if (!value) {
      return
    }

    const tab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //onValueChange?.(name)
    if (tab) {
      onTabChange?.(tab)
    }
  }

  // let tabListCls = TOGGLE_VARIANT_DEFAULT_LIST_CLS
  // //let tabButtonCls = TOGGLE_VARIANT_DEFAULT_BUTTON_CLS
  // let tabCls = TOGGLE_VARIANT_DEFAULT_TAB_CLS

  // if (variant === 'muted') {
  //   tabListCls = TOGGLE_VARIANT_TOOLBAR_LIST_CLS
  //   //tabButtonCls = TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS
  //   tabCls = TOGGLE_VARIANT_TOOLBAR_TAB_CLS
  // }

  return (
    <ToggleGroup
      type="single"
      value={selectedTab?.tab.id ?? ''}
      onValueChange={_onValueChange}
      className={toggleButtonVariants({ variant, className })}
      size={size}
      rounded={rounded}
      variant={variant}
    >
      {tabs.map((tab, ti) => {
        const tabId = tab.id //getTabId(tab)
        return (
          <ToggleGroupItem
            id={tabId}
            value={tabId}
            key={tabId}
            aria-label={tabId}
            justify="center"
            className={cn(
              'relative',
              variant === 'group' && ti === 0 && 'rounded-l-theme',
              variant === 'group' &&
                ti === tabs.length - 1 &&
                'rounded-r-theme',
              variant === 'gray' && ti === 0 && 'rounded-l-theme',
              variant === 'gray' && ti === tabs.length - 1 && 'rounded-r-theme'
            )}
            style={{
              width: tabPos.width,
              marginLeft: variant === 'group' && ti > 0 ? -1 : 0,
            }}
          >
            {showLabels && <span>{getTabName(tab)}</span>}
          </ToggleGroupItem>
        )
      })}

      {/* <motion.span
        className={tabCls}
        initial={false}
        animate={{ ...tabPos }}
        transition={{ ease: 'easeInOut' }}
      /> */}
    </ToggleGroup>
  )
}
