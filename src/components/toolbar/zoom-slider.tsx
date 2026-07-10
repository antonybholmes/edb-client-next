import { cn } from '@/lib/shadcn-utils'

import { type IDivProps } from '@/interfaces/div-props'

import {
  BaseSelectTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@/themed/v2/select'
import { useEffect, useState } from 'react'
// import { Slider } from "../toolbar/slider"
import { DEFAULT_ZOOM_CHANNEL_NAME, useZoom } from '@/providers/zoom-provider'
import { Slider } from '@/themed/v2/slider'

import { useDebounce } from '@/hooks/debounce'
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

  // We need to distinguish between user-initiated changes
  // to the slider and programmatic changes that occur when the zoom level
  // is updated from elsewhere in the app. To do this, we can keep track of
  // whether the slider change was initiated by the user or not.
  // When the slider value changes, we set a flag to indicate that
  // it was a user-initiated change. We then use a debounced effect
  // to update the zoom level after a short delay, but only if
  // the change was initiated by the user. If the zoom level is updated
  // programmatically (e.g., from another component), we reset the flag
  // so that it doesn't trigger an unnecessary zoom update.
  const [_index, _setIndex] = useState<{
    index: number
    userInitiated: boolean
  }>({ index, userInitiated: false })

  useEffect(() => {
    _setIndex({ index, userInitiated: false })
  }, [index])

  const debounceIndex = useDebounce(_index, { delayMs: 300 })

  useEffect(() => {
    if (
      debounceIndex.index >= 0 &&
      debounceIndex.index < levels.length &&
      debounceIndex.userInitiated
    ) {
      setZoom(levels[debounceIndex.index])
    }
  }, [debounceIndex, setZoom, levels])

  return (
    <VCenterRow className={cn('gap-x-1', className)}>
      <VCenterRow className="gap-x-1">
        <ToolbarFooterButton
          aria-label="Zoom Out"
          onClick={() => decreaseZoom()}
          size="icon-sm"
        >
          <Minus className="w-4 h-4" strokeWidth={2} />
        </ToolbarFooterButton>

        <Slider
          value={_index.index}
          min={0}
          max={levels.length - 1}
          onValueChange={(v) => {
            const l = Array.isArray(v) ? v[0]! : v

            _setIndex({ index: l, userInitiated: true })
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
        aria-label="Zoom level"
        value={formatZoom(zoom)}
        onTextChanged={(v) => {
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
        onValueChange={(value) => {
          if (value !== null) {
            console.log('Selected zoom level:', value)
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
              .map((v) => (
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
