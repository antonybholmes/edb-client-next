import type { IChildrenProps } from '@/interfaces/children-props'
import { COLOR_TRANSPARENT } from '@lib/color/color'
import { useState, type ReactNode } from 'react'
import { ColorPickerUI } from './color/color-picker-button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './shadcn/ui/themed/popover'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from './shadcn/ui/themed/tabs'

export interface IProps extends IChildrenProps {
  color2: string
  color3?: string
  color1?: string
  onColor2Change?: (color: string) => void
  onColor3Change?: (color: string) => void
  onColor1Change?: (color: string) => void

  showColor1?: boolean
  showColor2?: boolean
  showColor3?: boolean

  onShowColor1?: (show: boolean) => void
  onShowColor2?: (show: boolean) => void
  onShowColor3?: (show: boolean) => void

  width1?: number
  width2?: number
  width3?: number

  onWidthChange1?: (width: number) => void
  onWidthChange2?: (width: number) => void
  onWidthChange3?: (width: number) => void

  onCancel?: () => void
  allowNoColor?: boolean
  tooltips?: string[]
}

const TRIGGER_CLS = `relative shrink-0 w-16 h-10 flex flex-col items-center 
  justify-center data-[state=active]:bg-muted/50  data-[state=active]:font-bold
  data-[state=inactive]:hover:bg-muted/25 rounded-theme`

const DOT_CLS = 'rounded-full w-3 h-3 border border-border'

//const DOT_CLS = 'w-11 h-[2px]'

/**
 * Allow for easy selection of foreground and background colors in a compact component
 * @param param0
 * @returns
 */
export function ThreeColorMenu({
  color2 = COLOR_TRANSPARENT,
  color3 = COLOR_TRANSPARENT,
  color1 = COLOR_TRANSPARENT,
  onColor1Change,
  onColor2Change,
  onColor3Change,

  showColor1,
  showColor2,
  showColor3,

  onShowColor1,
  onShowColor2,
  onShowColor3,

  width1 = 1,
  width2 = 1,
  width3 = 1,

  onWidthChange1,
  onWidthChange2,
  onWidthChange3,

  onCancel = () => {},
  allowNoColor,

  tooltips = [],
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
          background: `linear-gradient(to right, ${color1}, ${color2}, ${color3})`,
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
          <TabsList
            variant="base"
            className="flex flex-row items-center justify-start gap-px"
          >
            <TabsTrigger
              value="text"
              className={TRIGGER_CLS}
              title="Text color"
              variant="base"
              //style={{ backgroundColor: color1 }}
            >
              <span className={DOT_CLS} style={{ backgroundColor: color1 }} />
              <span
              //className="border-b-3"
              //style={{ color: color1 }}
              >
                {tooltips.length > 0 ? tooltips[0] : 'Text'}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="border"
              className={TRIGGER_CLS}
              title="Border color"
              variant="base"
            >
              <span className={DOT_CLS} style={{ backgroundColor: color2 }} />
              <span
              //className="border-b-3"
              //style={{ color: color2 }}
              >
                {tooltips.length > 1 ? tooltips[1] : 'Border'}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="fill"
              className={TRIGGER_CLS}
              title="Fill color"
              variant="base"
            >
              <span className={DOT_CLS} style={{ backgroundColor: color3 }} />
              <span
              //className="border-b-3"
              //style={{ color: color3 }}
              >
                {tooltips.length > 2 ? tooltips[2] : 'Fill'}
              </span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="text" className="flex flex-col gap-y-2 w-64">
            <ColorPickerUI
              color={color1}
              onColorChange={color => onColor1Change?.(color)}
              onCancel={onCancel}
              className="w-full aspect-square rounded-xs"
              allowNoColor={allowNoColor}
              showColor={showColor1}
              onShowColor={onShowColor1}
              width={width1}
              onWidthChange={onWidthChange1}
            />
          </TabsContent>
          <TabsContent value="border" className="flex flex-col gap-y-2 w-64">
            <ColorPickerUI
              color={color2}
              onColorChange={color => onColor2Change?.(color)}
              onCancel={onCancel}
              className="w-full aspect-square rounded-xs"
              allowNoColor={allowNoColor}
              showColor={showColor2}
              onShowColor={onShowColor2}
              width={width2}
              onWidthChange={onWidthChange2}
            />
          </TabsContent>
          <TabsContent value="fill" className="flex flex-col gap-y-2 w-64">
            <ColorPickerUI
              color={color3}
              onColorChange={color => onColor3Change?.(color)}
              onCancel={onCancel}
              className="w-full aspect-square rounded-xs"
              allowNoColor={allowNoColor}
              showColor={showColor3}
              onShowColor={onShowColor3}
              width={width3}
              onWidthChange={onWidthChange3}
            />
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
