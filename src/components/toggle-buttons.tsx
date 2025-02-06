import type { IChildrenProps } from '@interfaces/children-props'
import type { IElementProps } from '@interfaces/element-props'
import { cn } from '@lib/class-names'
import { rangeMap } from '@lib/math/range'
import { sum } from '@lib/math/sum'
import type { VariantProps } from 'class-variance-authority'
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
} from './tab-provider'

// const BUTTON_CLS = cn(
//   FOCUS_RING_CLS,
//   'trans-color data-[state=active]:font-medium relative justify-center items-center boldable-text-tab z-10'
// )

// const TOGGLE_VARIANT_DEFAULT_BUTTON_CLS = cn(
//   BUTTON_CLS,
//   'data-[state=inactive]:hover:bg-background/90 h-full rounded'
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
  extends IElementProps,
    VariantProps<typeof toggleVariants> {
  showLabels?: boolean
  defaultWidth?: number
}

// const TOGGLE_VARIANT_DEFAULT_LIST_CLS =
//   'relative bg-muted p-0.75 rounded-theme overflow-hidden h-8.5 gap-x-1'

// const TOGGLE_VARIANT_TOOLBAR_LIST_CLS =
//   'relative rounded-theme overflow-hidden h-8.5'

// const TOGGLE_VARIANT_DEFAULT_TAB_CLS =
//   'absolute left-0.75 top-0.75 bottom-0.75 z-0 bg-background rounded-theme'

// const TOGGLE_VARIANT_TOOLBAR_TAB_CLS =
//   'absolute left-0 top-0 h-full z-0 bg-accent'

export function ToggleButtonTriggers({
  showLabels = true,
  defaultWidth = 4,
  //variant = 'default',
  size = 'default',
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
        (index) => (tabs[index]?.size ?? defaultWidth) + 0.25,
        0,
        selectedTab.index
      )
    )

    //const x = 0

    const width = tabs[selectedTab.index]!.size ?? defaultWidth

    setTabPos({ x: `${x}rem`, width: `${width}rem` })
  }, [selectedTab])

  function _onValueChange(value: string) {
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

  // if (variant === 'toolbar') {
  //   tabListCls = TOGGLE_VARIANT_TOOLBAR_LIST_CLS
  //   //tabButtonCls = TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS
  //   tabCls = TOGGLE_VARIANT_TOOLBAR_TAB_CLS
  // }

  return (
    <ToggleGroup
      type="single"
      value={selectedTab.tab.id}
      onValueChange={_onValueChange}
      className={cn('relative flex flex-row gap-x-0.5', className)}
      size={size}
      rounded={rounded}
    >
      {tabs.map((tab) => {
        const tabId = tab.id //getTabId(tab)
        return (
          <ToggleGroupItem
            value={tabId}
            key={tabId}
            aria-label={tab.id}
            //data-selected={_value === id}
            justify="center"
            className="relative z-10"
            style={{ width: tabPos.width }}
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
