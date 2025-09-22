import { BUTTON_MD_H_CLS, V_CENTERED_ROW_CLS } from '@/theme'
import { TabIndicatorProvider } from '@components/tabs/tab-indicator-provider'
import { TabIndicatorV } from '@components/tabs/tab-indicator-v'
import { cn } from '@lib/shadcn-utils'
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group'
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentRef,
} from 'react'

//const TAB_LINE_CLS = "absolute left-0 block stroke-theme w-[3px] z-10"
const DEFAULT_H = 1.5

const SideToggleGroup = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    h?: number
    padding?: number
    values: string[]
  }
>(({ values, h = DEFAULT_H, padding = 0.25, className, ...props }, ref) => {
  //const tabLineRef1 = useRef<HTMLSpanElement>(null)
  //const tabLineRef2 = useRef<HTMLSpanElement>(null)
  const [at, setAt] = useState(0)
  const [scale, setScale] = useState(0.6)
  const pressed = useRef(false)
  const itemHeight = h + 2 * padding

  useEffect(() => {
    const v = props?.value?.toString() ?? ''

    const idx = values.indexOf(v)

    if (idx > -1) {
      setAt(idx)
    }
  }, [props.value])

  return (
    <TabIndicatorProvider index={at} size={itemHeight} scale={scale}>
      <ToggleGroupPrimitive.Root
        ref={ref}
        className={cn('flex flex-col relative pl-1', className)}
        {...props}
      >
        {values.map((v, i) => {
          const selected = i === at
          return (
            <ToggleGroupItem
              key={i}
              value={v}
              onMouseDown={() => {
                pressed.current = true
                setScale(0.4)
              }}
              onMouseEnter={() => {
                if (selected) {
                  setScale(0.4)
                }
              }}
              onMouseUp={() => {
                pressed.current = false
              }}
              onMouseLeave={() => {
                if (selected) {
                  setScale(0.6)
                }
              }}
            >
              {v}
            </ToggleGroupItem>
          )
        })}

        <TabIndicatorV />
      </ToggleGroupPrimitive.Root>
    </TabIndicatorProvider>
  )
})

SideToggleGroup.displayName = ToggleGroupPrimitive.Root.displayName

const ITEM_CLS = cn(
  'flex flex-row text-xs font-medium hover:bg-muted w-full text-left px-2 rounded-theme',
  V_CENTERED_ROW_CLS,
  BUTTON_MD_H_CLS
)

const ToggleGroupItem = forwardRef<
  ComponentRef<typeof ToggleGroupPrimitive.Item>,
  ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, children, ...props }, ref) => {
  //const context = useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(ITEM_CLS, className)}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = ToggleGroupPrimitive.Item.displayName

export { SideToggleGroup, ToggleGroupItem }
