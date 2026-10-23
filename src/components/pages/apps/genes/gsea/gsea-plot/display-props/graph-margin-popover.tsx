import { MarginIcon } from '@/components/icons/margin-icon'
import { PlotMarginContent } from '@/components/plot/axes/props/plot-margin-popover'
import {
  Popover,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/baseui/popover'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { produce } from 'immer'
import { useGseaSettings } from '../gsea-settings'

export function GraphMarginPopover() {
  const { settings, updateSettings } = useGseaSettings()

  return (
    <Popover>
      <PopoverTrigger
        render={
          <ToolbarButton title="Graph Margins">
            <MarginIcon />
            <span>Graph</span>
          </ToolbarButton>
        }
      ></PopoverTrigger>

      <PlotMarginContent
        margin={settings.graph.margin}
        updateMargin={(margin) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.graph.margin = margin
            })
          )
        }
      />
    </Popover>
  )
}
