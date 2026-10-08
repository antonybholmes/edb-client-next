import { PlotMarginPopover } from '@/components/plot/axes/plot/plot-margin-popover'
import { produce } from 'immer'
import { useGseaSettings } from './gsea-settings-store'

export function MarginPopover() {
  const { settings, updateSettings } = useGseaSettings()

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
