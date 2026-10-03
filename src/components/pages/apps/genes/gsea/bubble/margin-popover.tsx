import { PlotMarginPopover } from '@/components/plot/axes/plot/plot-margin-popover'
import { produce } from 'immer'
import { useGseaBubbleSettings } from '../gsea-plot/bubble/gsea-bubble-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useGseaBubbleSettings()

  return (
    <PlotMarginPopover
      margin={settings.plot.margin}
      updateMargin={(margin) =>
        updateSettings(
          produce(settings, (draft) => {
            draft.plot.margin = margin
          })
        )
      }
    />
  )
}
