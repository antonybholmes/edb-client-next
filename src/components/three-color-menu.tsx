import type { IChildrenProps } from '@/interfaces/children-props'
import { COLOR_TRANSPARENT } from '@/lib/color/color'
import { useState, type ReactNode } from 'react'
import { ColorPickerUI } from './plot/color-picker-popover'
import type { ITextProps } from './plot/svg-props'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './shadcn/ui/themed/v2/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './shadcn/ui/themed/v2/tabs'

interface IColorChange {
  tooltip: string
  color: string
  opacity?: number
  width?: number
  font?: ITextProps
  onColorChange: (color: string, opacity: number, width: number) => void
  onFontChange?: ((font: ITextProps) => void) | undefined
  onShowColor?: ((show: boolean) => void) | undefined
}

export interface IProps extends IChildrenProps {
  colors: IColorChange[]

  // color2: string
  // color3?: string
  // color1?: string
  // onColor2Change?: (color: string, opacity: number, width: number) => void
  // onColor3Change?: (color: string, opacity: number, width: number) => void
  // onColor1Change?: (color: string, opacity: number, width: number) => void

  // showColor1?: boolean
  // showColor2?: boolean
  // showColor3?: boolean

  // onShowColor1?: (show: boolean) => void
  // onShowColor2?: (show: boolean) => void
  // onShowColor3?: (show: boolean) => void

  // width1?: number
  // width2?: number
  // width3?: number

  // font1?: IFontProps
  // font2?: IFontProps
  // font3?: IFontProps
  // onFont1Change?: (font: IFontProps) => void
  // onFont2Change?: (font: IFontProps) => void
  // onFont3Change?: (font: IFontProps) => void

  onCancel?: () => void
  allowNoColor?: boolean
}

const TRIGGER_CLS = `relative shrink-0 w-14 h-10 flex flex-col items-center 
  justify-center data-active:bg-muted/50 data-active:font-bold
  hover:bg-muted/25 rounded-theme gap-y-1`

const DOT_CLS = 'rounded-xs w-5 h-1  border border-foreground'

/**
 * Allow for easy selection of foreground and background colors in a compact component
 * @param param0
 * @returns
 */
export function ThreeColorMenu({
  colors = [
    {
      tooltip: 'Text',
      color: COLOR_TRANSPARENT,
      onColorChange: () => {},
    },
    {
      tooltip: 'Border',
      color: COLOR_TRANSPARENT,
      onColorChange: () => {},
    },
    {
      tooltip: 'Fill',
      color: COLOR_TRANSPARENT,
      onColorChange: () => {},
    },
  ],

  allowNoColor,

  children,
}: IProps) {
  const [open, setOpen] = useState(false)

  let button: ReactNode

  if (children) {
    button = children
  } else {
    button = (
      <PopoverTrigger
        className="rounded-full shrink-0 aspect-square w-5 h-5 overflow-hidden border border-foreground"
        style={{
          background: `linear-gradient(to right, ${colors[0]!.color}, ${colors[1]!.color}, ${colors[2]!.color})`,
        }}
        title="Change colors"
      />
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {button}

      <PopoverContent
        align="start"
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        className="gap-y-2 flex-row"
        variant="content"
      >
        <Tabs defaultValue="text" className="flex flex-col gap-y-2">
          <TabsList className="flex flex-row items-center justify-center gap-px">
            {colors.map((c, i) => (
              <TabsTrigger
                key={i}
                value={c.tooltip.toLowerCase()}
                className={TRIGGER_CLS}
                title={c.tooltip}
                variant="base"
              >
                <span>{c.tooltip}</span>
                <span
                  className={DOT_CLS}
                  style={{ backgroundColor: c.color }}
                />
              </TabsTrigger>
            ))}
          </TabsList>
          {colors.map((c, i) => (
            <TabsContent
              key={i}
              value={c.tooltip.toLowerCase()}
              className="flex flex-col gap-y-2 w-64"
            >
              <ColorPickerUI
                color={c.color}
                onColorChange={({ color, opacity, width }) =>
                  c.onColorChange(color, opacity, width ?? 1)
                }
                allowNoColor={allowNoColor}
                showColor={true}
                onShowColor={c.onShowColor}
                width={c.width}
                font={c.font}
                fontUpdate={c.onFontChange}
              />
            </TabsContent>
          ))}
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
