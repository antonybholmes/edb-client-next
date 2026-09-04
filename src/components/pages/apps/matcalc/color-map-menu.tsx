import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { ColorMapIcon } from '@/components/plot/color-map-icon'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'

import { BWR_CMAP_V2, COLOR_MAP_MENU, ColorMap } from '@/lib/color/colormap'
import { cn } from '@/lib/shadcn-utils'
import { SwatchBook } from 'lucide-react'
import { useState } from 'react'

export const BUTTON_CLS = cn(
  'relative border border-transparent rounded-md aspect-square w-8 h-8',
  'data-[checked=true]:border-app-theme data-[checked=false]:hover:border-border/50',
  'data-[checked=false]:hover:scale-110 data-[checked=false]:hover:shadow-md trans-all',
  'data-[checked=true]:scale-110 data-[checked=false]:focus-visible:scale-110',
  'data-[checked=false]:focus-visible:border-border group flex items-center justify-center'
)

export function ColorMapMenuIcon({ cmap }: { cmap: ColorMap }) {
  return (
    <HCenterCol className="relative w-6 h-6 aspect-square">
      <SwatchBook className="relative z-10" size={16} strokeWidth={1.5} />
      <ColorMapIcon
        cmap={cmap}
        aspect="aspect-3/1"
        className="absolute bottom-0 w-5 border border-foreground/80 rounded-xs"
      />
    </HCenterCol>
  )
}

export function ColorMapMenuContent({
  cmap,
  onChange,
}: {
  cmap: ColorMap
  onChange?: (cmap: ColorMap) => void
}) {
  return (
    <DropdownMenuContent>
      {/* {Object.keys(COLOR_MAPS)
          .sort()
          .map((c, ci) => {
            const cm = COLOR_MAPS[c]!
            return (
              <DropdownMenuCheckboxItem
                key={cm.id}
                onClick={() => {
                  _onChange(cm)
                }}
                checked={cm.id === cmap.id}
              >
                <VCenterRow className="gap-x-2">
                  <ColorMapIcon
                    cmap={cm}
                    aspect="aspect-5/4"
                    className="w-6 border border-foreground/70 rounded-sm"
                  />
                  <span>{cm.name}</span>
                </VCenterRow>
              </DropdownMenuCheckboxItem>
            )
          })} */}

      {COLOR_MAP_MENU.map((group) => (
        <DropdownMenuSub key={group.label}>
          <DropdownMenuSubTrigger>{group.label}</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent side="right">
              {group.cmaps.map((cm) => (
                <DropdownMenuCheckboxItem
                  key={cm.id}
                  onClick={() => {
                    onChange(cm)
                  }}
                  checked={cm.id === cmap.id}
                >
                  <VCenterRow className="gap-x-2">
                    <ColorMapIcon
                      cmap={cm}
                      aspect="aspect-5/4"
                      className="w-6 border border-foreground/70 rounded-sm"
                    />
                    <span>{cm.name}</span>
                  </VCenterRow>
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      ))}
      {/* <MenuSeparator />
      <DropdownMenuCheckboxItem
        onClick={() => {
          onChange(BWR_CMAP_V2)
        }}
        checked={cmap.id === BWR_CMAP_V2.id}
      >
        Reverse
      </DropdownMenuCheckboxItem> */}
    </DropdownMenuContent>
  )
}

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
    onChange?.(cmap)
  }

  return (
    // <Popover open={open} onOpenChange={setOpen}>
    //   <PopoverTrigger title="Change colormap" onClick={() => setOpen(true)}>
    //     <ColorMapIcon
    //       cmap={cmap}
    //       aspect="aspect-3/2"
    //       className="w-8 border border-foreground/70 rounded-sm"
    //     />
    //   </PopoverTrigger>

    //   <PopoverContent
    //     align={align}

    //     className="fill-foreground"
    //     variant="content"
    //   >
    //     <div className="grid grid-cols-4 gap-1">
    //       {Object.keys(COLOR_MAPS)
    //         .sort()
    //         .map((c, ci) => {
    //           const cm = COLOR_MAPS[c]!
    //           return (
    //             <button
    //               onClick={() => _onChange(cm)}
    //               key={ci}
    //               data-checked={cm.id === cmap.id}
    //               title={cm.name}
    //               className={BUTTON_CLS}
    //             >
    //               <ColorMapIcon
    //                 cmap={cm}
    //                 data-checked={cm.name === cmap.name}
    //                 aspect="aspect-4/3"
    //                 className="w-6 rounded-sm border border-foreground/70"
    //               />
    //             </button>
    //           )
    //         })}
    //     </div>
    //   </PopoverContent>
    // </Popover>

    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title="Colormap"
        onClick={() => setOpen(true)}
        render={
          <ToolbarIconButton>
            <ColorMapMenuIcon cmap={cmap} />
          </ToolbarIconButton>
        }
      />
      <ColorMapMenuContent cmap={cmap} onChange={_onChange} />
    </DropdownMenu>
  )
}

export function ColorMapToolbarMenu({
  cmap = BWR_CMAP_V2,
  align = 'start',
  onChange,
}: IProps) {
  const [open, setOpen] = useState(false)

  function _onChange(cmap: ColorMap) {
    //setOpen(false)
    onChange?.(cmap)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        title="Colormap"
        onClick={() => setOpen(true)}
        render={
          <ToolbarIconButton>
            <ColorMapMenuIcon cmap={cmap} />
          </ToolbarIconButton>
        }
      />

      <ColorMapMenuContent cmap={cmap} onChange={_onChange} />
    </DropdownMenu>
  )
}
