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
  'relative aspect-square border-4 border-transparent p-0.5',
  'data-[checked=true]:border-border data-[checked=false]:hover:border-border data-[checked=false]:focus-visible:border-border',
  "data-[checked=true]:after:content-[''] data-[checked=true]:after:-m-[4px] data-[checked=true]:after:absolute",
  'data-[checked=true]:after:left-0 data-[checked=true]:after:top-0 data-[checked=true]:after:right-0',
  'data-[checked=true]:after:bottom-0 data-[checked=true]:after:inset-0 data-[checked=true]:after:border-1',
  'data-[checked=true]:after:border-foreground/75'
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
    console.log('ss', cmap)
    setOpen(false)
    onChange?.(cmap)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger title="Change colormap" onClick={() => setOpen(true)}>
        <ColorMapIcon
          cmap={cmap}
          className="w-8 border border-foreground rounded-sm"
        />
      </PopoverTrigger>

      <PopoverContent
        align={align}
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        className="fill-foreground"
        variant="content"
      >
        <div className="grid grid-cols-4 gap-0.5">
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
                    aspect="aspect-square"
                    className="w-6 border border-foreground"
                  />
                </button>
              )
            })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
