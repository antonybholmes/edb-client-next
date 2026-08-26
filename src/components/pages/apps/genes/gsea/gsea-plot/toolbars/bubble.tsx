import { ColorMapMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_OPTIONS, TEXT_SORT } from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { produce } from 'immer'
import { SORT_BY_ITEMS } from '../../bubble/gsea-bubble-dialog'
import {
  Mode,
  MODE_ITEMS,
  SortBy,
  useGseaBubbleSettings,
} from '../bubble/gsea-bubble-settings-store'

export function BubbleToolbar() {
  const { settings, updateSettings } = useGseaBubbleSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_OPTIONS} className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>Mode</span>
            <SelectList
              items={MODE_ITEMS}
              variant="toolbar"
              onValueChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.scale.mode = v as Mode
                  })
                )
              }
              value={settings.scale.mode}
              w="xs"
            >
              {MODE_ITEMS.map((item) => (
                <SelectItem value={item.value} key={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectList>
          </ToolbarRow>
          <Checkbox
            checked={settings.phenotypes.merge}
            onCheckedChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.phenotypes.merge = v
                })
              )
            }}
          >
            Merge Phenotypes
          </Checkbox>
        </ToolbarCol>
        <ToolbarCol>
          <ColorMapMenu
            align="end"
            cmap={getColorMap(settings.scale.cmap)}
            onChange={(cmap) => {
              // store the cmap the user likes
              updateSettings(
                produce(settings, (draft) => {
                  draft.scale.cmap = cmap.id as ColorMapName
                })
              )
            }}
          />
        </ToolbarCol>
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Bubbles" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>{TEXT_SORT}</span>
            <SelectList
              items={SORT_BY_ITEMS}
              variant="toolbar"
              onValueChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.sortBy = v as SortBy
                  })
                )
              }
              value={settings.sortBy}
              w="xs"
            >
              {SORT_BY_ITEMS.map((item) => (
                <SelectItem value={item.value} key={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectList>
          </ToolbarRow>
          <ToolbarRow>
            <span>Radius</span>
            <NumericalInput
              id="size"
              value={settings.bubbles.size}
              placeholder="Size..."
              dp={0}
              h="sm"
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.bubbles.size = v
                  })
                )
              }}
            />
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
