import { PlotMarginPopover } from '@/components/plot/axes/props/plot-margin-popover'
import { produce } from 'immer'
import { useVolcanoSettings } from '../volcano-settings'

export function MarginPopover() {
  const { settings, updateSettings } = useVolcanoSettings()

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
