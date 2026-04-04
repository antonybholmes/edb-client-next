import { useEffect, useRef, type RefObject } from 'react'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  type ITabTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowV } from '@/components/tabs/tab-indicator-follow-v'
import { TabIndicatorSelectedV } from '@/components/tabs/tab-indicator-selected-v'
import { useTabIndicators } from '@/components/tabs/tab-indicator-store'
import { useStableId } from '@/hooks/stable-id'
import type { IChildrenProps } from '@/interfaces/children-props'
import type { IHistoryEntry } from './history-manager'
import { useHistory, type IHistoryState } from './history-store'

// const TAB_LINE_CLS =
//   'absolute left-0 top-0 bottom-0 bg-border bg-theme z-20 scale-y-80'

function Trigger({
  step,
  ti,
  cursor,
  tabListRef,
  buttonsRef,
  ...props
}: {
  step: IHistoryEntry<IHistoryState>

  ti: number
  cursor: number
  buttonsRef: RefObject<HTMLElement[]>
  tabListRef: RefObject<HTMLDivElement | null>
} & ITabTrigger) {
  //const ref = useRef<HTMLSpanElement>(null)
  //const [hover, setHover] = useState(false)

  const {
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators(step.id)

  function _scale(index: number) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.5,
    })
  }

  const selected = ti === cursor

  //const id = getUrlFriendlyTag(tab.id)

  return (
    <TabsTrigger
      variant="base"
      aria-label={step.name}
      title={step.name}
      data-checked={selected}
      ref={el => {
        buttonsRef.current[ti] = el!
      }}
      onMouseEnter={() => {
        if (selected) {
          setSelectedTabPosition({
            scale: 0.5,
          })
        }
        _scale(ti)
      }}
      onMouseLeave={() => {
        if (selected) {
          setSelectedTabPosition({
            scale: 0.6,
          })
        }
      }}
      className="flex flex-col px-2.5 h-12 justify-center gap-x-1 ml-2 relative shrink-0 data-[checked=false]:hover:bg-muted/25 data-[checked=true]:bg-muted/50 rounded-theme"
      {...props}
    >
      <span className="font-semibold text-left truncate">
        {`${ti + 1}. ${step.name}`}
      </span>

      <span className="text-left text-foreground/50 truncate">
        {step.description}
      </span>
    </TabsTrigger>
  )
}

interface IShortcutProps extends IChildrenProps {
  id?: string

  defaultHeight?: number
  showIcons?: boolean
  showLabels?: boolean
}

export function HistoryTabs({ id }: IShortcutProps) {
  const _id = id || useStableId('history-tabs')

  const { history, cursor, historyGoto } = useHistory()

  //const { tabIndex, setTab } = useTabs(_id)
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
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators(_id)

  // function _onValueChange(value: string) {
  //   const selectedTab = getTabFromValue(value, tabs)
  //   //const [name, index] = parseTabId(value)

  //   //setValue(value)

  //   //onValueChange?.(name)
  //   if (selectedTab) {
  //     console.log('ToolbarMenu _onValueChange', value, selectedTab)
  //     //setTabIndex(selectedTab.index)
  //     setTab(selectedTab.index)
  //   }
  // }

  // useEffect(() => {
  //   setTab(0)
  // }, [])

  useEffect(() => {
    if (!buttonsRef.current[cursor] || !tabListRef.current) {
      return
    }

    function updateSize(buttonRef: HTMLElement, animate = true) {
      const containerRect = tabListRef.current!.getBoundingClientRect()

      const clientRect = buttonRef.getBoundingClientRect()

      const y = clientRect.top - containerRect.top
      const h = clientRect.height

      setSelectedTabPosition({
        y,
        h,
        animate,
        scale: 0.6,
      })
    }

    updateSize(buttonsRef.current[cursor]!)

    /* if (initial.current) {
      initial.current = false
      const timeout = setTimeout(() => {
        updateSize(buttonsRef.current[cursor]!, false)
        //console.log('Updated after 2s!')
      }, 100)

      return () => clearTimeout(timeout) // Cleanup
    } else {
      updateSize(buttonsRef.current[stepIndex]!)
      return
    } */

    initial.current = false
  }, [cursor])

  return (
    <Tabs
      value={cursor}
      onValueChange={v => {
        console.log('HistoryTabs onValueChange', v)
        historyGoto(v)
      }}
      //className="flex flex-col shrink-0"
      orientation="vertical"
    >
      <TabsList
        //className={cn('relative shrink-0', className)}
        ref={tabListRef}
        onMouseLeave={() => {
          setTabPosition(undefined)
        }}
        className="gap-y-px"
      >
        {history.map((step, hi) => {
          //const selected = hi === stepIndex
          return (
            <Trigger
              value={step.id}
              step={step}
              ti={hi}
              cursor={cursor}
              key={hi}
              buttonsRef={buttonsRef}
              tabListRef={tabListRef}
            />
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
