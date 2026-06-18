import { cn } from '@/lib/shadcn-utils'

import { type IDivProps } from '@/interfaces/div-props'

import {
  BaseSelectTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/themed/v2/select'
import { useState } from 'react'
// import { Slider } from "../toolbar/slider"
import { DEFAULT_ZOOM_CHANNEL_NAME, useZoom } from '@/providers/zoom-provider'
import { Slider } from '@/themed/v2/slider'

import { ChevronDown, Minus, Plus } from 'lucide-react'
import { VCenterRow } from '../layout/v-center-row'
import { Input } from '../shadcn/ui/themed/v2/input'
import { ToolbarFooterButton } from './toolbar-footer-button'

function formatZoom(scale: number): string {
  return `${(scale * 100).toFixed(0)}%`
}

interface IZoomSliderProps extends IDivProps {
  channel?: string
}

export function ZoomSlider({
  channel = DEFAULT_ZOOM_CHANNEL_NAME,
  className,
}: IZoomSliderProps) {
  const { index, levels, setZoom, increaseZoom, decreaseZoom } =
    useZoom(channel)

  return (
    <VCenterRow className={cn('gap-x-1', className)}>
      <VCenterRow className="gap-x-3">
        <ToolbarFooterButton
          aria-label="Zoom Out"
          onClick={() => decreaseZoom()}
          size="icon-sm"
          //variant="theme-muted"
        >
          <Minus className="w-4 h-4" strokeWidth={2} />
        </ToolbarFooterButton>

        <Slider
          value={index}
          min={0}
          max={levels.length - 1}
          onValueChange={(value: number | readonly number[]) => {
            setZoom(Array.isArray(value) ? value[0]! : value)
          }}
          step={1}
          className="w-20"
        />

        <ToolbarFooterButton
          aria-label="Zoom In"
          onClick={() => increaseZoom()}
          size="icon-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
        </ToolbarFooterButton>
      </VCenterRow>

      <ZoomSelect channel={channel} />
    </VCenterRow>
  )
}

export function ZoomSelect({
  channel = DEFAULT_ZOOM_CHANNEL_NAME,
}: IZoomSliderProps) {
  const [open, setOpen] = useState(false)

  const { zoom, levels, setZoom } = useZoom(channel)

  function _setValue(value: number) {
    console.log('Setting zoom to', value)
    setZoom(value)
    setOpen(false)
  }

  return (
    <VCenterRow
      data-open={open}
      className="gap-x-1 border border-border/50 rounded-theme bg-background h-6 pl-1.5 overflow-hidden focus-within:border-border hover:border-border data-[open=true]:border-border"
    >
      <Input
        variant="plain"
        value={formatZoom(zoom)}
        onTextChanged={v => {
          const parsed = parseInt(v.replace('%', ''))

          if (!isNaN(parsed)) {
            _setValue(parsed / 100)
          }
        }}
        className="w-10"
      />
      <Select
        open={open}
        onOpenChange={setOpen}
        value={zoom}
        onValueChange={value => {
          if (value !== null) {
            _setValue(value)
          }
        }}
      >
        <BaseSelectTrigger
          className="flex flex-col items-center justify-center data-popup-open:bg-app-theme/30 w-5 h-6 data-[expanded=true]:bg-app-theme/30"
          aria-label="Show zoom levels"
        >
          <ChevronDown size={16} />
        </BaseSelectTrigger>

        <SelectContent className="text-xs">
          <SelectGroup>
            {/* <SelectLabel>Zoom Level</SelectLabel> */}

            {levels
              .map((l, li) => ({ index: li, value: l }))
              .sort((a, b) => b.index - a.index)
              .map(v => (
                <SelectItem value={v.value} key={v.index}>
                  {formatZoom(v.value)}
                </SelectItem>
              ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </VCenterRow>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
