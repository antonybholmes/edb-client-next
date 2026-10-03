import { PlotMarginPopover } from '@/components/plot/axes/plot/plot-margin-popover'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useNetworkSettings()

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
