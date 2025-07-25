import { useContext, useEffect, useMemo, useRef, type ReactNode } from 'react'

import type { IChildrenProps } from '@interfaces/children-props'
import { TabsList, TabsTrigger } from '../shadcn/ui/themed/tabs'

import { cn } from '@lib/shadcn-utils'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from './tab-provider'

import { cva, type VariantProps } from 'class-variance-authority'
import { VCenterRow } from '../layout/v-center-row'

import { BUTTON_SM_H_CLS, FOCUS_INSET_RING_CLS } from '@/theme'
import { truncate } from '@lib/text/text'
import { TabIndicatorH } from './tab-indicator-h'
import { TabIndicatorContext } from './tab-indicator-provider'

//export const UNDERLINE_TAB_CLS =
//  'px-2.5 py-1.5 rounded-sm group trans-color focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted trans-color mb-1'

export const tabVariants = cva(
  cn(
    FOCUS_INSET_RING_CLS,
    'group trans-color trans-color flex flex-row items-center'
  ),
  {
    variants: {
      variant: {
        default:
          'rounded-theme overflow-hidden mb-1 focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted px-2 py-1',
        sheet:
          'focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted',
        tab: '',
      },
    },
  }
)

export const tabButtonVariants = cva(
  'group trans-color trans-color focus-visible:bg-muted hover:bg-muted data-[checked=true]:bg-muted overflow-hidden',
  {
    variants: {
      variant: {
        default: cn(BUTTON_SM_H_CLS, 'px-2 mb-1 rounded-theme'),
        sheet: 'py-2 px-1 w-16 flex flex-row justify-center',
        tab: 'border',
      },
    },
  }
)

export const UNDERLINE_LABEL_CLS =
  'boldable-text-tab data-[checked=true]:font-semibold text-foreground/75 truncate'

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

interface IProps
  extends ITabProvider,
    IChildrenProps,
    VariantProps<typeof tabVariants>,
    ITabMenu {
  buttonClassName?: string
  maxNameLength?: number
}

export function UnderlineTabs({
  value,
  tabs,
  maxNameLength = -1,
  variant = 'default',
  className,
  children,
}: IProps) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLButtonElement[]>([])
  const itemsRef = useRef<HTMLSpanElement[]>([])
  const pressed = useRef(false)

  const { setTabIndicatorPos } = useContext(TabIndicatorContext)
  //const [scale, setScale] = useState(1)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  function _scale(scale: number) {
    if (!selectedTab) {
      return
    }

    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect =
      scale > 1
        ? buttonsRef.current[selectedTab.index]!.getBoundingClientRect()
        : itemsRef.current[selectedTab.index]!.getBoundingClientRect()

    setTabIndicatorPos({
      x: clientRect.left - containerRect.left,
      size: clientRect.width,
    })
  }

  useEffect(() => {
    if (selectedTab) {
      // the first render is for setup, after that
      // scale the line to max width because this is
      // when the user starts clicking on tabs
      _scale(pressed.current ? 2 : 1)
    }
  }, [selectedTab?.index])

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)}>
      <TabsList variant="base" className="relative" ref={tabListRef}>
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
              ref={el => {
                buttonsRef.current[ti] = el!
              }}
              onMouseEnter={() => {
                if (selected) {
                  _scale(2)
                }
              }}
              onMouseLeave={() => {
                if (selected) {
                  _scale(1)
                }
              }}
              onMouseDown={() => {
                pressed.current = true
              }}
              onMouseUp={() => {
                pressed.current = false
              }}
              className={tabButtonVariants({
                variant,
              })}
            >
              <span
                data-checked={selected}
                ref={el => {
                  itemsRef.current[ti] = el!
                }}
                aria-label={tab.id}
                className={UNDERLINE_LABEL_CLS}
              >
                {truncatedName}
              </span>
            </TabsTrigger>

            // <TabsTrigger key={tab.id} value={tab.id}>{tab.id}</TabsTrigger>
          )
        })}

        {/* <ToolbarTabLine tabPos={tabPos} /> */}

        <TabIndicatorH />
      </TabsList>

      {/* </Reorder.Group> */}
      {children && children}
    </VCenterRow>
  )
}
