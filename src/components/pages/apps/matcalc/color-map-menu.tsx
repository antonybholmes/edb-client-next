import { ColorMapIcon } from '@components/plot/color-map-icon'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/popover'
import { BWR_CMAP_V2, COLOR_MAPS, ColorMap } from '@lib/color/colormap'
import { cn } from '@lib/shadcn-utils'
import { useState } from 'react'

export const BUTTON_CLS = cn(
  'relative border-2 border-transparent rounded-full p-[2px]',
  'data-[checked=true]:border-foreground data-[checked=false]:hover:border-foreground/50 data-[checked=false]:focus-visible:border-border'
)

interface IProps {
  cmap: ColorMap
  align?: 'start' | 'end'
  onChange?: (cmap: ColorMap) => void
}

export function ColorMapMenu({
  cmap = BWR_CMAP_V2,
  align = 'start',
  onChange,
}: IProps) {
  const [open, setOpen] = useState(false)

  function _onChange(cmap: ColorMap) {
    setOpen(false)
    onChange?.(cmap)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger title="Change colormap" onClick={() => setOpen(true)}>
        <ColorMapIcon
          cmap={cmap}
          aspect="aspect-3/2"
          className="w-8 border border-foreground  rounded-full"
        />
      </PopoverTrigger>

      <PopoverContent
        align={align}
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        className="fill-foreground"
        variant="content"
      >
        <div className="grid grid-cols-5 gap-0.5">
          {Object.keys(COLOR_MAPS)
            .sort()
            .map((c, ci) => {
              const cm = COLOR_MAPS[c]!
              return (
                <button
                  onClick={() => _onChange(cm)}
                  key={ci}
                  data-checked={cm.name === cmap.name}
                  title={cm.name}
                  className={BUTTON_CLS}
                >
                  <ColorMapIcon
                    cmap={cm}
                    data-checked={cm.name === cmap.name}
                    aspect="aspect-square"
                    className="w-6 rounded-full"
                  />
                </button>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
