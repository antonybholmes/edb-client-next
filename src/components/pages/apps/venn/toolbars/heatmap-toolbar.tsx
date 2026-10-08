import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { TEXT_OPTIONS } from '@/consts'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { useVennSettings } from '../venn-settings-store'

export function HeatmapToolbar() {
  const { settings, updateSettings } = useVennSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_OPTIONS} className="gap-x-2">
        <ToolbarCol gap="gap-x-2">
          <ToolbarRow>
            <Checkbox
              checked={settings.heatmap.showDiagonal}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.showDiagonal = checked
                  })
                )
              }}
            >
              Diagonal
            </Checkbox>
          </ToolbarRow>
          <ToolbarRow>
            <Checkbox
              checked={settings.heatmap.upperTriangular}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.upperTriangular = checked
                  })
                )
              }}
            >
              Upper Triangular
            </Checkbox>
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarRow>
          <span>Metric</span>
          <SelectList
            variant="toolbar"
            w="sm"
            value={settings.heatmap.metric}
            format={(v) => capitalCase(v)}
            onValueChange={(value) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.heatmap.metric = value as 'jaccard' | 'overlap'
                })
              )
            }}
          >
            <SelectItem value="jaccard">Jaccard</SelectItem>
            <SelectItem value="overlap">Overlap</SelectItem>
          </SelectList>
        </ToolbarRow>
      </ToolbarTabGroup>
    </>
  )
}
