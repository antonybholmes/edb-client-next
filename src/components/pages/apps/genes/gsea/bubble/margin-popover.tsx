import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { NumericalPropRow } from '@/dialogs/numerical-prop-row'

import { MarginIcon } from '@/components/icons/margin-icon'
import { produce } from 'immer'
import { useGseaBubbleSettings } from '../gsea-plot/bubble/gsea-bubble-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useGseaBubbleSettings()

  //const title = `Top:${settings.plot.margin.top}, Left:${settings.plot.margin.left}, Bottom:${settings.plot.margin.bottom}, Right:${settings.plot.margin.right}`

  return (
    <Popover>
      <PopoverTrigger
        title="Margins"
        aria-label="Margins"
        w="none"
        className="opacity-50 hover:opacity-100 data-popup-open:opacity-100 transition-opacity text-xs"
      >
        <MarginIcon />
      </PopoverTrigger>

      <PopoverContent className="gap-y-1 flex-col w-42" variant="content">
        <NumericalPropRow
          title="Top"
          limit={[0, 1000]}
          value={settings.plot.margin.top}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.margin.top = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Left"
          limit={[0, 1000]}
          value={settings.plot.margin.left}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.margin.left = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Bottom"
          limit={[0, 1000]}
          value={settings.plot.margin.bottom}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.margin.bottom = v
              })
            )
          }
        />
        <NumericalPropRow
          title="Right"
          limit={[0, 1000]}
          value={settings.plot.margin.right}
          onNumChanged={(v) =>
            updateSettings(
              produce(settings, (draft) => {
                draft.margin.right = v
              })
            )
          }
        />
      </PopoverContent>
    </Popover>
  )
}
