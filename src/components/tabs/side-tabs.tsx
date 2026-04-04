import { cn } from '@/lib/shadcn-utils'
import { useEffect, useRef, type RefObject } from 'react'

import {
  getTabFromValue,
  getTabName,
  type ITab,
} from '@/components/tabs/tab-provider'
import { useStableId } from '@/hooks/stable-id'
import { EMPTY_RECT } from '@/interfaces/rect'
import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'
import { type IToolbarProps } from '../toolbar/toolbar'
import { TabIndicatorFollowV } from './tab-indicator-follow-v'
import { TabIndicatorSelectedV } from './tab-indicator-selected-v'
import { useTabIndicators } from './tab-indicator-store'
import { useTabs } from './tab-store'

// const TAB_LINE_CLS =
//   'absolute left-0 top-0 bottom-0 bg-border bg-theme z-20 scale-y-80'

function Trigger({
  groupId,
  tab,

  showLabels,
  showIcons = true,
  defaultHeight = 1.9,
  tabListRef,
  buttonsRef,
}: {
  groupId: string
  tab: ITab

  showLabels: boolean
  showIcons?: boolean
  defaultHeight?: number
  tabListRef: RefObject<HTMLDivElement | null>
  buttonsRef: RefObject<HTMLElement[]>
}) {
  const { tab: selectedTab } = useTabs(groupId)

  const name = getTabName(tab)
  const selected = tab.id === selectedTab?.id

  const {
    position,
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators(groupId)

  function _scale(index: number) {
    if (!selected) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      ...(position || EMPTY_RECT),
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.6,
    })

    // const h = clientRect.height
    // const s = h * scale

    // setTabPosition({
    //   ...EMPTY_RECT,
    //   y: clientRect.top + h / 2 - s * 0.5 - containerRect.top,
    //   h: s,
    // })

    // const s = size * scale

    // setTabIndicatorPos({
    //   x: (index + 0.5) * size - s * 0.5,
    //   size: s,
    //   //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    // })
  }

  return (
    <span
      id={tab.id}
      key={tab.id}
      aria-label={name}
      title={!showLabels ? name : undefined}
      data-selected={selected}
      ref={el => {
        buttonsRef.current[selectedTab?.index || 0] = el!
      }}
      // onMouseDown={() => {
      //   // console.log('mouse down', tab.id, selected)
      //   // if (selected) {
      //   //   gsap.set(`#tab-line-${id}`, {
      //   //     scaleY: 1,
      //   //   })
      //   // }
      //   //pressed.current = true
      //   onTabChange?.({ index: ti, tab })
      // }}
      onMouseEnter={() => {
        if (selected) {
          setSelectedTabPosition({
            scale: 0.6,
          })
        }
        _scale(selectedTab?.index || 0)
      }}
      onMouseLeave={() => {
        if (selected) {
          setSelectedTabPosition({
            scale: 0.8,
          })
        }
      }}
      className="flex flex-row gap-x-1 items-center data-[selected=true]:font-semibold relative shrink-0 hover:bg-background rounded-theme group"
      style={{
        height: `${defaultHeight}rem`,
        minWidth: `${defaultHeight}rem`,
        justifyContent: showLabels ? 'flex-start' : 'center',
      }}
    >
      {showIcons && tab.icon && (
        <span
          className="w-4.5 fill-foreground stroke-foreground data-[selected=true]:fill-theme data-[selected=true]:stroke-theme"
          data-selected={tab.id === selectedTab?.id}
        >
          {tab.icon}
        </span>
      )}
      {showLabels && <span className="px-2">{name}</span>}
    </span>
  )
}

interface IShortcutProps extends IToolbarProps {
  id?: string
  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

export function SideTabs({
  id,
  onTabChange = undefined,
  tabs = [],
  defaultHeight = 1.9,
  showIcons = true,
  showLabels = true,
  className,
}: IShortcutProps) {
  const _id = id || useStableId('side-tabs')

  const { tab: selectedTab, setTab } = useTabs(_id)
  //const pressed = useRef(false)
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])
  const initial = useRef(true)
  // const h = `${defaultHeight}rem`

  // const [tabPos, setTabPos] = useState<{ y: string; height: string }>({
  //   y: '0rem',
  //   height: `${defaultHeight}rem`,
  // })

  const {
    selectedPosition,
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators(_id)

  function _onValueChange(value: string) {
    const selectedTab = getTabFromValue(value, tabs)
    //const [name, index] = parseTabId(value)

    //setValue(value)

    //onValueChange?.(name)
    if (selectedTab) {
      //setTabIndex(selectedTab.index)

      console.log('side tab change', value, selectedTab, _id)

      setTab({ id: selectedTab.tab.id, index: selectedTab.index })

      onTabChange?.(selectedTab)
    }
  }

  // useEffect(() => {
  //   setTab(0)
  // }, [])

  useEffect(() => {
    if (
      !selectedTab ||
      !buttonsRef.current[selectedTab.index] ||
      !tabListRef.current
    ) {
      return
    }

    const ref = buttonsRef.current[selectedTab.index]!

    function updateSize(buttonRef: HTMLElement, animate = true) {
      const containerRect = tabListRef.current!.getBoundingClientRect()

      const clientRect = buttonRef.getBoundingClientRect()

      const y = clientRect.top - containerRect.top
      const h = clientRect.height

      setSelectedTabPosition({
        ...(selectedPosition || EMPTY_RECT),
        y,
        h,
        animate,
        scale: 0.8,
      })
    }

    if (initial.current) {
      initial.current = false
      const timeout = setTimeout(() => {
        updateSize(ref, false)
      }, 100)

      return () => clearTimeout(timeout) // Cleanup
    } else {
      updateSize(ref)
      return
    }
  }, [selectedTab])

  return (
    <Tabs
      value={selectedTab?.id ?? ''}
      onValueChange={_onValueChange}
      className="flex flex-col shrink-0"
      orientation="vertical"
    >
      <TabsList
        className={cn('relative shrink-0 pl-1.5 pr-1', className)}
        ref={tabListRef}
        onMouseLeave={() => {
          setTabPosition(undefined)
        }}
      >
        {tabs.map((tab, ti) => {
          return (
            <TabsTrigger variant="base" value={tab.id} id={tab.id} key={tab.id}>
              <Trigger
                tab={tab}
                groupId={_id}
                defaultHeight={defaultHeight}
                key={ti}
                tabListRef={tabListRef}
                showLabels={showLabels}
                showIcons={showIcons}
                buttonsRef={buttonsRef}
              />
            </TabsTrigger>
          )
        })}

        {/* <motion.span
        className="absolute left-0 w-0.75 z-0 bg-theme rounded-full"
        animate={{ ...tabPos }}
        transition={{ ease: 'easeInOut' }}
      /> */}

        <TabIndicatorSelectedV groupId={_id} />
        <TabIndicatorFollowV groupId={_id} />
      </TabsList>
    </Tabs>
  )
}
