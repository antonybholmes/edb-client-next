import { cn } from '@lib/shadcn-utils'

import { type IDivProps } from '@interfaces/div-props'
import { SelectTrigger } from '@radix-ui/react-select'
import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '../shadcn/ui/themed/select'
// import { Slider } from "../toolbar/slider"
import { useZoom } from '@/providers/zoom-provider'
import { range } from '@lib/math/range'
import { Slider } from '@themed/slider'
import { Minus, Plus } from 'lucide-react'
import { VCenterRow } from '../layout/v-center-row'
import { ToolbarFooterButton } from './toolbar-footer-button'

export const DEFAULT_ZOOM_SCALES = [0.25, 0.5, 0.75, 1, 2, 4] //[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3, 4]

function formatZoom(scale: number): string {
  return `${(scale * 100).toFixed(0)}%`
}

interface IZoomSliderProps extends IDivProps {
  zoom?: number | undefined
  onZoomChange?: (zoom: number) => void
  zoomScales?: number[] | undefined
  inc?: number | undefined
}

export function ZoomSlider({
  zoom,
  onZoomChange,
  zoomScales = DEFAULT_ZOOM_SCALES,
  inc = 0.25,
  className,
}: IZoomSliderProps) {
  const [open, setOpen] = useState(false)

  const { zoom: globalZoom, setZoom: setGlobalZoom } = useZoom()

  const [_zoom, setZoom] = useState(zoom ?? globalZoom)

  useEffect(() => {
    if (zoom !== undefined) {
      setZoom(zoom)
    }
  }, [zoom])

  function _setValue(value: number) {
    //const index = Math.floor(value)

    setZoom(value)
    onZoomChange?.(value)
    setGlobalZoom(value)

    setOpen(false)
  }

  return (
    <VCenterRow className={cn('gap-x-1.5', className)}>
      <ToolbarFooterButton
        title="Zoom Out"
        onClick={() => _setValue(Math.max(zoomScales[0]!, _zoom - inc))}
        size="icon-xs"
        variant="theme-muted"
      >
        <Minus className="w-4 h-4" strokeWidth={2} />
      </ToolbarFooterButton>

      <Slider
        value={[
          Math.max(
            zoomScales[0]!,
            Math.min(_zoom, zoomScales[zoomScales.length - 1]!)
          ),
        ]} //[Math.max(0, Math.min(scaleIndex, ZOOM_SCALES.length))]}
        //defaultValue={[1]}
        min={zoomScales[0]!}
        max={zoomScales[zoomScales.length - 1]!}
        onValueChange={(values: number[]) => _setValue(values[0]!)}
        step={1}
        className="w-24"
      />

      <ToolbarFooterButton
        title="Zoom In"
        onClick={() =>
          _setValue(Math.min(zoomScales[zoomScales.length - 1]!, _zoom + inc))
        }
        size="icon-xs"
        variant="theme-muted"
      >
        <Plus className="w-4 h-4" strokeWidth={2} />
      </ToolbarFooterButton>

      <Select
        open={open}
        onOpenChange={setOpen}
        value={_zoom.toString()}
        onValueChange={(value) => _setValue(Number(value))}
      >
        <SelectTrigger asChild>
          <ToolbarFooterButton
            className={cn('w-12 justify-center')}
            checked={open}
            aria-label="Show zoom levels"
            variant="theme-muted"
          >
            {formatZoom(_zoom)}
          </ToolbarFooterButton>
        </SelectTrigger>
        <SelectContent className="text-xs">
          <SelectGroup>
            {/* <SelectLabel>Zoom Level</SelectLabel> */}

            {range(zoomScales.length)
              .toReversed()
              .map((i) => (
                <SelectItem value={zoomScales[i]!.toString()} key={i}>
                  {formatZoom(zoomScales[i]!)}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      {/* <BaseDropDown open={open} onOpenChange={setOpen}>
        <ToolbarFooterButton
          className={cn("w-12 justify-center focus-visible:bg-primary/20")}
          checked={open}
        >
          {formatZoom(scaleIndex)}
        </ToolbarFooterButton>
        <>
          {range(ZOOM_SCALES.length)
            .toReversed()
            .map(i => (
              <DropdownMenuItem onClick={() => _setValue(i)} key={i}>
                {i === scaleIndex && (
                  <CheckIcon className="stroke-foreground" />
                )}
                <span>{formatZoom(i)}</span>
              </DropdownMenuItem>
            ))}
        </>
      </BaseDropDown> */}
    </VCenterRow>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
