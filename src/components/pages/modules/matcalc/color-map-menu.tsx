import { ColorMapIcon } from '@components/plot/color-map-icon'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@components/shadcn/ui/themed/dropdown-menu'

import { BWR_CMAP, ColorMap, JET_CMAP, VIRIDIS_CMAP } from '@lib/colormap'
import { useState } from 'react'

const COLOR_MAPS = [
  { name: 'BWR', cmap: BWR_CMAP },
  { name: 'Viridis', cmap: VIRIDIS_CMAP },
  { name: 'Jet', cmap: JET_CMAP },
]

interface IProps {
  cmap: ColorMap
  align?: 'start' | 'end'
  onChange?: (cmap: ColorMap) => void
}

export function ColorMapMenu({
  cmap = BWR_CMAP,
  align = 'start',
  onChange,
}: IProps) {
  const [open, setOpen] = useState(false)

  function _onChange(cmap: ColorMap) {
    setOpen(false)
    onChange?.(cmap)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title="Change colormap"
        onClick={() => setOpen(true)}
      >
        <ColorMapIcon
          cmap={cmap}
          className="w-6 border border-foreground rounded-sm"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        className="fill-foreground"
      >
        {COLOR_MAPS.map((c, ci) => (
          <DropdownMenuItem onClick={() => _onChange(c.cmap)} key={ci}>
            <ColorMapIcon
              cmap={c.cmap}
              className="w-6 border border-foreground rounded-sm"
            />
            {c.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
