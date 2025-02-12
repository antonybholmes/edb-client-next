import {
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactNode,
} from 'react'

import type { IChildrenProps } from '@interfaces/children-props'
import { BaseTabsList, BaseTabsTrigger } from '../shadcn/ui/themed/tabs'

import { cn } from '@/lib/class-names'
import {
  getTabFromValue,
  getTabName,
  type ITab,
  type ITabProvider,
} from '../tab-provider'

import { ANIMATION_DURATION_S } from '@/consts'
import { truncate } from '@/lib/text/text'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'motion/react'
import { ChevronRightIcon } from '../icons/chevron-right-icon'
import { VCenterRow } from '../layout/v-center-row'

import type { IClassProps } from '@/interfaces/class-props'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../shadcn/ui/themed/dropdown-menu'

//export const UNDERLINE_TAB_CLS =
//  'px-2.5 py-1.5 rounded group trans-color focus-visible:bg-accent hover:bg-accent data-[selected=true]:bg-accent trans-color mb-1'

export const tabVariants = cva(
  'group trans-color trans-color flex flex-row items-center',
  {
    variants: {
      variant: {
        default:
          ' py-1 rounded-theme mb-1 focus-visible:bg-accent/30 hover:bg-accent/30 data-[selected=true]:bg-accent/30',
        sheet:
          'py-2 focus-visible:bg-accent/30 hover:bg-accent/30 data-[selected=true]:bg-accent/30',
        tab: '',
      },
    },
  }
)

export const UNDERLINE_LABEL_CLS =
  'boldable-text-tab group-hover:font-medium data-[selected=true]:font-medium'

export interface ITabPos {
  x: number
  width: number
  //transform?: string
}

export function ToolbarTabLine({ tabPos }: { tabPos: ITabPos }) {
  return (
    <motion.span
      className="absolute bottom-0 h-0.5 z-0 bg-theme"
      animate={{ ...tabPos }}
      transition={{ ease: 'easeInOut', duration: ANIMATION_DURATION_S }}
      initial={false}
      //transition={{ type: "spring" }}
    />
  )
}

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

export const UnderlineTabs = forwardRef(function UnderlineTabs(
  {
    value,
    tabs,
    maxNameLength = -1,
    variant = 'default',
    buttonClassName,
    className,
    menuCallback = () => {},
    menuActions = [],
    children,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  const tabListRef = useRef<HTMLDivElement>(null)
  const buttonsRef = useRef<HTMLButtonElement[]>([])
  const itemsRef = useRef<HTMLSpanElement[]>([])
  const [scale, setScale] = useState(0)

  const [tabPos, setTabPos] = useState<ITabPos>({
    x: 0,
    width: 0,
    //transform: `scaleX(1)`,
  })

  //console.log(value,  tabs)

  const selectedTab = useMemo(() => getTabFromValue(value, tabs), [value, tabs])

  useEffect(() => {
    //const x = tabUnderlineProps[tabId]!.x + (_scale === 1 ? padding : 0)
    //const width = tabUnderlineProps[tabId]!.w - (_scale === 1 ? 2 * padding : 0)

    //console.log(selectedTab.index)

    //const button = buttonsRef.current[selectedTab.index]!

    //const buttonRect = button.getBoundingClientRect()
    const containerRect = tabListRef.current!.getBoundingClientRect()

    const clientRect =
      scale > 1
        ? buttonsRef.current[selectedTab.index]!.getBoundingClientRect()
        : itemsRef.current[selectedTab.index]!.getBoundingClientRect()

    // setTabPos({
    //   x: `${x}rem`,
    //   width: `${width}rem`,
    // })

    setTabPos({
      x: clientRect.left - containerRect.left,
      width: clientRect.width,
      //transform: `scaleX(${ 1})`, //`scaleX(${scale > 1 ? trueScale : 1})`,
    })

    // currentTab.current = tabUnderlineProps[tabId].x
    // initial.current = false
  }, [selectedTab, scale])

  function UnderlineTab({
    index,
    tab,
    selected,
    maxNameLength,
    variant,
    menuCallback,
    menuActions,
    className,
  }: {
    index: number
    tab: ITab
    selected: boolean
    maxNameLength: number
    menuCallback?: (tab: ITab, action: string) => void
    menuActions?: IMenuAction[]
  } & VariantProps<typeof tabVariants> &
    IClassProps) {
    //const id = makeTabId(tab, ti)
    //const w = tab.size ?? defaultWidth
    const tabId = tab.id //getTabId(tab)

    const [show, setShow] = useState(false)

    const name = getTabName(tab)
    const truncatedName = truncate(name, {
      length: maxNameLength,
    })

    return (
      <VCenterRow
        className={tabVariants({ variant, className })}
        aria-label={name}
        //aria-label={truncatedName}
        data-selected={show}
      >
        <BaseTabsTrigger
          value={tabId}
          key={tabId}
          ref={(el) => {
            buttonsRef.current[index] = el!
          }}
          aria-label={name}
          onMouseEnter={() => {
            if (selected) {
              setScale(2)
            }
          }}
          onMouseLeave={() => {
            if (selected) {
              setScale(1)
            }
          }}
          onMouseDown={() => {
            setScale(2)
          }}
          className="px-2"
        >
          <span
            data-selected={selected}
            ref={(el) => {
              itemsRef.current[index] = el!
            }}
            aria-label={truncatedName}
            className={UNDERLINE_LABEL_CLS}
          >
            {truncatedName}
          </span>
        </BaseTabsTrigger>

        {menuActions && menuActions.length > 0 && menuCallback && (
          <DropdownMenu open={show} onOpenChange={setShow}>
            <DropdownMenuTrigger className="pr-1">
              <ChevronRightIcon className="rotate-90" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {menuActions.map((menuAction, ai) => (
                <DropdownMenuItem
                  key={ai}
                  onClick={() => menuCallback?.(tab, menuAction.action)}
                  aria-label={menuAction.action}
                >
                  {menuAction.icon && menuAction.icon}
                  <span>{menuAction.action}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </VCenterRow>
    )
  }

  return (
    <VCenterRow className={cn('justify-between gap-x-1', className)} ref={ref}>
      {/* <Reorder.Group
        axis="x"
        values={tabs.map(tab => tab.id)}
        onReorder={(order)=>{}}
      > */}
      <BaseTabsList className="relative text-xs" ref={tabListRef}>
        {tabs.map((tab, ti) => {
          //const id = makeTabId(tab, ti)
          //const w = tab.size ?? defaultWidth
          const selected = tab.id === selectedTab.tab.id // tab.id === selectedTab?.tab.id

          return (
            // <Reorder.Item key={tab.id} value={tab.id}>
            <UnderlineTab
              key={ti}
              index={ti}
              tab={tab}
              selected={selected}
              maxNameLength={maxNameLength}
              variant={variant}
              menuCallback={menuCallback}
              menuActions={menuActions}
              className={buttonClassName}
            />
            // </Reorder.Item>
          )
        })}

        <ToolbarTabLine tabPos={tabPos} />
      </BaseTabsList>
      {/* </Reorder.Group> */}
      {children && children}
    </VCenterRow>
  )
})
