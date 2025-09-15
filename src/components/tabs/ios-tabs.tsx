import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

import { TabsList, TabsTrigger } from '../shadcn/ui/themed/tabs'

import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from './tab-provider'

import { ANIMATION_DURATION_S } from '@/consts'
import { cn } from '@lib/shadcn-utils'
import { truncate } from '@lib/text/text'
import type { TabsProps } from '@radix-ui/react-tabs'
import gsap from 'gsap'

// export function ToolbarTabLine({ tabPos }: { tabPos: ITabPos }) {
//   return (
//     <motion.span
//       className="absolute bottom-0 h-0.5 z-0 bg-theme"
//       animate={{ ...tabPos }}
//       transition={{ ease: 'easeInOut', duration: ANIMATION_DURATION_S }}
//       initial={false}
//       //transition={{ type: "spring" }}
//     />
//   )
// }

export interface IMenuAction {
  action: string
  icon?: ReactNode
}

export interface ITabMenu {
  menuCallback?: (tab: ITab, action: string) => void
  menuActions?: IMenuAction[]
}

interface IProps extends ITabProvider, ITabMenu, TabsProps {
  buttonClassName?: string
  maxNameLength?: number
  defaultWidth?: string
}

export function IOSTabsList({
  value,
  tabs,
  maxNameLength = -1,
  defaultWidth = '80px',
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const indicatorRef = useRef<HTMLSpanElement>(null)
  const buttonsRef = useRef<HTMLButtonElement[]>([])
  const [focus, setFocus] = useState(false)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  const initial = useRef(true)

  useEffect(() => {
    if (!selectedTab) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRef = buttonsRef.current[selectedTab.index]!

    const clientRect = clientRef.getBoundingClientRect()

    const duration = initial.current ? 0 : ANIMATION_DURATION_S

    gsap.to(indicatorRef.current, {
      x: clientRect.left - containerRect.left, // + paddingLeft,
      //width: clientRect.width,
      duration: duration,
      ease: 'power2.inOut',
    })

    initial.current = false
  }, [selectedTab?.index])

  const segment = useMemo(
    () =>
      selectedTab?.index === 0
        ? 'start'
        : selectedTab?.index === tabs.length - 1
          ? 'end'
          : 'middle',
    [selectedTab?.index]
  )

  return (
    <TabsList
      ref={tabListRef}
      variant="base"
      data-focus={focus}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      className="relative bg-muted/90 hover:bg-muted trans-color rounded-full p-[2px]"
    >
      {tabs.map((tab, ti) => {
        //const id = makeTabId(tab, ti)
        //const w = tab.size ?? defaultWidth
        const selected = tab.id === selectedTab?.tab.id // tab.id === selectedTab?.tab.id

        const name = getTabName(tab)
        const truncatedName = truncate(name, {
          length: maxNameLength,
        })

        return (
          <TabsTrigger
            variant="base"
            value={tab.id}
            id={tab.id}
            key={tab.id}
            data-checked={selected}
            ref={(el) => {
              buttonsRef.current[ti] = el!
            }}
            className={cn('z-20 data-[checked=true]:font-semibold h-7.5')}
            style={{ width: defaultWidth }}
          >
            {truncatedName}
          </TabsTrigger>

          // <TabsTrigger key={tab.id} value={tab.id}>{tab.id}</TabsTrigger>
        )
      })}

      <span
        data-segment={segment}
        ref={indicatorRef}
        className="bg-background z-10 left-0 top-1/2 -translate-y-1/2 absolute rounded-full"
        style={{ width: defaultWidth, height: 'calc(100% - 4px)' }}
      />
    </TabsList>
  )
}
