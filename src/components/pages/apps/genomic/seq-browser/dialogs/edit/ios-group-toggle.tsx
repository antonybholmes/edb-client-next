import { VCenterRow } from '@/components/layout/v-center-row'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { TabIndicatorIosSelected } from '@/components/tabs/tab-indicator-ios-selected'
import { useTabIndicators } from '@/components/tabs/tab-indicator-provider'
import { getTabName, ITab } from '@/components/tabs/tab-provider'
import { ComponentProps, useEffect, useMemo, useRef } from 'react'

interface IProps extends ComponentProps<typeof ToggleGroup> {
  /**
   * The width of the of a toggle in REM
   */
  w: number
  tabs: ITab[]
}

export function IosGroupToggle({ w, value, tabs, ...props }: IProps) {
  const { setSelectedPosition, selectedPosition } = useTabIndicators()

  const currentValue = useRef<string>(null)

  const v: string | undefined = useMemo(
    () => (value ? (Array.isArray(value) ? value[0] : value) : undefined),
    [value]
  )

  useEffect(() => {
    if (!v || v === currentValue.current) {
      return
    }

    const idx = tabs.findIndex((t) => t.id === v || t.name === v)

    if (idx === -1) {
      return
    }

    // if (!buttonRefs.current.has(v)) {
    //   return
    // }

    // const el = buttonRefs.current.get(v)!

    // const containerRect = parentRef.current!.getBoundingClientRect()

    // const clientRect = el.getBoundingClientRect()

    // setSelectedPosition({
    //   ...selectedPosition,
    //   x: clientRect.left - containerRect.left,
    //   w: clientRect.width,
    //   //scale: 1.05,
    //   //h: clientRect.height,
    //   //y: clientRect.top - containerRect.top,
    // })

    setSelectedPosition({
      ...selectedPosition,
      x: `${idx * w}rem`,
      w: `${w}rem`,
      // If currentValue is null, it means this is the first time we're setting the position
      // so we want to set the scale to 1 as this is a the setup pass. After that we want to set the
      // scale to 1.05 because that indicates to user they selecteded a tab. This is to match
      // the scaling effect when user hovers over a selected tab.
      scale: 1, //currentValue.current ? 1.05 : 1,

      //h: clientRect.height,
      //y: clientRect.top - containerRect.top,
    })

    currentValue.current = v
  }, [v])

  return (
    <VCenterRow className="rounded-full p-0.5 overflow-hidden bg-muted/40 border border-border/30 text-xs relative">
      <ToggleGroup
        value={value}
        {...props}
        size="sm"
        className="rounded-full overflow-hidden gap-x-px relative"
        variant="ios"
      >
        {tabs.map((t) => {
          const isSelected = t.id === v || t.name === v
          return (
            <GroupToggle
              key={t.id}
              value={t.id}
              className="z-50"
              rounded="full"
              style={{
                width: `${w}rem`,
              }}

              onMouseEnter={() => {
                if (isSelected) {
                  setSelectedPosition({
                    ...selectedPosition,
                    scale: 1.05,
                  })
                }
              }}

              onMouseLeave={() => {
                if (isSelected) {
                  setSelectedPosition({
                    ...selectedPosition,
                    scale: 1,
                  })
                }
              }}
            >
              {getTabName(t)}
            </GroupToggle>
          )
        })}

        <TabIndicatorIosSelected />
      </ToggleGroup>
    </VCenterRow>
  )
}
