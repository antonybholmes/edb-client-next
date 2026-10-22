import { PlotMarginPopover } from '@/components/plot/axes/props/plot-margin-popover'
import { produce } from 'immer'
import { useGseaBubbleSettings } from '../gsea-bubble-settings'

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
