import { SelectItem, SelectList } from '@/themed/v2/select'

// import { Slider } from "../toolbar/slider"
import { DEFAULT_ZOOM_CHANNEL_NAME, useZoom } from '@/providers/zoom-provider'

export function formatZoom(scale: number): string {
  return `${(scale * 100).toFixed(0)}%`
}

export function ZoomSelectList({
  channel = DEFAULT_ZOOM_CHANNEL_NAME,
}: {
  channel?: string
}) {
  const { zoom, levels, setZoom } = useZoom({ channel })

  return (
    <SelectList
      value={zoom}
      onValueChange={(value) => setZoom(value as number)}
      w="xs"
      items={levels.map((l, li) => ({ value: l, label: formatZoom(l) }))}
    >
      {levels
        .map((l, li) => ({ index: li, value: l }))
        .sort((a, b) => b.index - a.index)
        .map((v) => (
          <SelectItem value={v.value} key={v.index}>
            {formatZoom(v.value)}
          </SelectItem>
        ))}
    </SelectList>
  )
}

//font-semibold bg-blue-600 hover:bg-blue-600 text-white shadow-md rounded px-5 py-3 trans"
