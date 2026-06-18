import { useEffect, useRef } from 'react'

import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowV } from '@/components/tabs/tab-indicator-follow-v'
import {
  TabIndicatorProvider,
  useTabIndicators,
} from '@/components/tabs/tab-indicator-provider'
import { TabIndicatorSelectedV } from '@/components/tabs/tab-indicator-selected-v'

import { cn } from '@/lib/shadcn-utils'
import { useHistory } from './history-store'

const TRIGGER_CLS = cn(
  'flex flex-row px-2.5 h-11 items-center gap-x-1 ml-2 justify-between',
  'relative shrink-0 data-[selected=false]:hover:bg-muted/25',
  'data-[selected=true]:bg-muted/50 rounded-theme'
)

function HistoryTabsContent() {
  const { history, cursor, seek } = useHistory()

  //const { tabIndex, setTab } = useTabs(_id)
  //const pressed = useRef(false)
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLElement[]>([])
  const initial = useRef(true)

  const {
    setPosition: setTabPosition,
    setSelectedPosition: setSelectedTabPosition,
  } = useTabIndicators()

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

    initial.current = false
  }, [cursor])

  function _scale(index: number) {
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect = buttonsRef.current[index]!.getBoundingClientRect()

    setTabPosition({
      y: clientRect.top - containerRect.top,
      h: clientRect.height,
      scale: 0.5,
    })
  }

  return (
    <Tabs
      value={cursor}
      onValueChange={v => {
        seek(v)
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
          const isSelected = hi === cursor
          return (
            <TabsTrigger
              variant="base"
              aria-label={step.name}
              title={step.name}
              data-selected={isSelected}
              value={step.id}
              key={hi}
              ref={el => {
                buttonsRef.current[hi] = el!
              }}
              onMouseEnter={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.5,
                  })
                }
                _scale(hi)
              }}
              onMouseLeave={() => {
                if (isSelected) {
                  setSelectedTabPosition({
                    scale: 0.6,
                  })
                }
              }}
              className={TRIGGER_CLS}
            >
              <span className="font-semibold text-left truncate">
                {`${hi + 1}. ${step.name}`}
              </span>

              <span className="text-left text-foreground/50 truncate">
                {step.description}
              </span>
            </TabsTrigger>
          )
        })}

        <TabIndicatorSelectedV />
        <TabIndicatorFollowV />
      </TabsList>
    </Tabs>
  )
}

export function HistoryTabs() {
  return (
    <TabIndicatorProvider>
      <HistoryTabsContent />
    </TabIndicatorProvider>
  )
}
