import { type IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { useEffect, useRef } from 'react'

import { type ITooltipSide } from '@/interfaces/tooltip-side-props'

import { useStableId } from '@/hooks/stable-id'
import { EMPTY_RECT } from '@/interfaces/rect'
import { FOCUS_INSET_RING_CLS } from '@/theme'
import { Tabs, TabsList, TabsTrigger } from '../shadcn/ui/themed/v2/tabs'
import { SimpleTooltip } from '../shadcn/ui/themed/v2/tooltip'
import { TabIndicatorFollowV } from '../tabs/tab-indicator-follow-v'

import { useTabIndicators } from '../tabs/tab-indicator-provider'
import { useTabs } from '../tabs/tab-provider'

const BUTTON_CLS = cn(
  FOCUS_INSET_RING_CLS,
  'flex flex-row items-center justify-center data-[checked=true]:bg-muted',
  'data-[checked=false]:stroke-foreground data-[checked=true]:stroke-theme',
  'data-[checked=false]:hover:bg-background trans-color rounded-theme'
)

interface IShortcutProps {
  defaultWidth?: number
  gap?: number
}

interface IShortcutsProps extends IDivProps, ITooltipSide {
  gap?: number
}

export function ShortcutContent({
  gap = 0.5,
  className,
  ...props
}: IShortcutsProps) {
  const _id = useStableId('shortcut-tabs')

  const { selectedTab, selectedTabIndex, setTab, tabs } = useTabs(_id)

  const { position, setPosition: setTabIndicatorPos } = useTabIndicators()
  const pressed = useRef(false)

  function _scale(index: number, scale: number) {
    const s = (position?.h || 0) * scale

    setTabIndicatorPos({
      ...EMPTY_RECT,
      y: index * gap + (index + 0.5) * (position?.h || 0) - s * 0.5,
      h: s,
      //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    })
  }

  useEffect(() => {
    _scale(selectedTabIndex, pressed.current ? 0.6 : 0.4)
  }, [selectedTabIndex])

  const w = `${position?.h || 0}rem`

  return (
    <Tabs
      orientation="vertical"
      value={selectedTab?.id ?? ''}
      onValueChange={(v) => {
        //const idx = where(tabs, (t) => t.id === v)
        //if (idx.length > 0) {
        setTab(v) //{ index: idx[0]!, tab: tabs[idx[0]!]! })
        //}
      }}
    >
      <TabsList
        variant="default"
        className={cn(
          'relative shrink-0 items-center my-2 w-header pl-0.5 ml-0.5',
          className
        )}
        style={{ rowGap: `${gap}rem` }}
        {...props}
      >
        {tabs.map((t, ti) => {
          const selected = t.id === selectedTab?.id
          return (
            <SimpleTooltip content={t.id} key={ti} side="right">
              <TabsTrigger
                variant="base"
                key={ti}
                value={t.id}
                aria-label={t.id}
                data-checked={selected}
                // onClick={() => {
                //   onTabChange?.({ index: ti, tab })
                // }}
                onMouseDown={() => {
                  pressed.current = true
                }}
                onMouseEnter={() => {
                  if (selected) {
                    _scale(ti, 0.6)
                  }
                }}
                // onMouseDown={() => {
                //   setScale(0.3)
                // }}

                onMouseUp={() => {
                  pressed.current = false
                }}
                onMouseLeave={() => {
                  if (selected) {
                    _scale(ti, 0.4)
                  }
                }}
                style={{ width: w, height: w }}
                className={BUTTON_CLS}
              >
                {t.icon}
              </TabsTrigger>
            </SimpleTooltip>
          )
        })}

        <TabIndicatorFollowV groupId={_id} />
      </TabsList>
    </Tabs>
  )
}

export function Shortcuts({ gap = 0.25 }: IShortcutProps) {
  return <ShortcutContent gap={gap} />
}
