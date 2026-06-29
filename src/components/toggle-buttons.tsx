import type { IChildrenProps } from '@/interfaces/children-props'
import type { IDivProps } from '@/interfaces/div-props'
import { rangeMap } from '@/lib/math/range'
import { sum } from '@/lib/math/sum'
import { cn } from '@/lib/shadcn-utils'
import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, useContext, useEffect, useState } from 'react'
import { BaseCol } from './layout/base-col'
import { type toggleVariants } from './shadcn/ui/themed/v2/toggle'
import { GroupToggle, ToggleGroup } from './shadcn/ui/themed/v2/toggle-group'
import {
  getTabFromValue,
  getTabName,
  ISelectedTab,
  ITab,
  ITabChange,
  TabChange,
} from './tabs/tab-provider'

export interface ITabProvider extends ITabChange {
  value?: string
  tabs?: ITab[]
}

export interface ITabContext extends ITabChange {
  value: string
  selectedTab: ISelectedTab | null
  tabs: ITab[]
}

export const TabContext = createContext<ITabContext>({
  value: '',
  selectedTab: null,
  tabs: [],
})

interface ITabProviderProps extends ITabProvider, IDivProps {}

/**
 * Single use tab provider for things like toggle buttons
 * @param param0
 * @returns
 */
export function TabProvider({
  value,
  onTabChange,
  tabs,
  children,
}: ITabProviderProps) {
  const [_value, setValue] = useState('')

  function _onTabChange(selectedTab: ISelectedTab) {
    setValue(selectedTab.tab.id)

    onTabChange?.(selectedTab)
  }

  const v = value !== undefined ? value : _value

  const selectedTab = getTabFromValue(v, tabs ?? [])

  if (!selectedTab) {
    return null
  }

  return (
    <TabContext.Provider
      value={{
        value: v,
        selectedTab,
        onTabChange: _onTabChange,
        tabs: tabs ?? [],
      }}
    >
      {children}
    </TabContext.Provider>
  )
}

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
  extends IDivProps, VariantProps<typeof toggleVariants> {
  showLabels?: boolean
  defaultWidth?: number
}

export const toggleButtonVariants = cva('relative flex flex-row', {
  variants: {
    variant: {
      default: 'rounded-theme overflow-hidden',
      outline: 'p-0.25 rounded-theme bg-muted',
      gray: '',
      //colorful: '',
      'app-theme': '',
      tab: 'gap-x-0.5',
      group: 'rounded-theme bg-background',
      'ios':''
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
  //let tabButtonCls = TOGGLE_VARIANT_DEFAULT_BUTTON_CLS
  // let tabCls = TOGGLE_VARIANT_DEFAULT_TAB_CLS

  // if (variant === 'flat') {
  //   tabListCls = TOGGLE_VARIANT_TOOLBAR_LIST_CLS
  //   //tabButtonCls = TOGGLE_VARIANT_TOOLBAR_BUTTON_CLS
  //   tabCls = TOGGLE_VARIANT_TOOLBAR_TAB_CLS
  // }

  return (
    <ToggleGroup
      value={[selectedTab?.tab.id ?? '']}
      onValueChange={(v) => _onValueChange(v[0] ?? '')}
      className={toggleButtonVariants({ variant, className })}
      size={size}
      rounded={rounded}
      variant={variant}
    >
      {tabs.map((tab, ti) => {
        const tabId = tab.id //getTabId(tab)
        return (
          <GroupToggle
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
          </GroupToggle>
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
