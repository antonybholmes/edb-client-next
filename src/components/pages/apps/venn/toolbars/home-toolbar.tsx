import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { numSort } from '@/lib/math/math'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { ColorMapMenu } from '../../matcalc/color-map-menu'
import { useOpen } from '../use-open'
import { useVennSettings } from '../venn-settings-store'

export function HomeToolbar() {
  const { openFiles } = useOpen()
  const { saveAs } = useSVG()
  const { settings, updateSettings } = useVennSettings()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) =>
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openFiles(files)
                }),
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('venn')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Heatmap" className="gap-x-2">
        <ToolbarCol gap="gap-x-2">
          <ToolbarRow>
            <Checkbox
              checked={settings.heatmap.cluster.rows.on}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.cluster.rows.on = checked as boolean
                  })
                )
              }}
            >
              Cluster rows
            </Checkbox>
          </ToolbarRow>
          <ToolbarRow>
            <Checkbox
              checked={settings.heatmap.cluster.cols.on}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.cluster.cols.on = checked as boolean
                  })
                )
              }}
            >
              Cluster columns
            </Checkbox>
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarSeparator />
        <ToolbarCol>
          <ToolbarRow>
            Z-score
            <SelectList
              variant="toolbar"
              w="sm"
              value={settings.heatmap.cluster.zscore}
              items={[
                { value: 'row', label: 'Row' },
                { value: 'col', label: 'Column' },
                { value: 'all', label: 'All' },
                { value: 'none', label: 'None' },
              ]}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.cluster.zscore = value as
                      'row' | 'col' | 'all' | 'none'
                  })
                )
              }}
            >
              <SelectItem value="row">Row</SelectItem>
              <SelectItem value="col">Column</SelectItem>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="none">None</SelectItem>
            </SelectList>
          </ToolbarRow>
          <ToolbarRow>
            Scale
            <NumericalInput
              value={settings.heatmap.dot.scale}
              limit={[0.01, 10]}
              step={0.01}
              dp={2}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.dot.scale = value
                  })
                )
              }}
            />
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarCol>
          <ToolbarRow>
            Legend
            <Input
              title="Legend"
              value={settings.heatmap.dot.sizes.join(', ')}
              onTextChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.heatmap.dot.sizes = numSort(
                      v.split(/[,\|;]+/).map((x) => parseFloat(x.trim()))
                    )
                  })
                )
              }}
              w="md"
            />
          </ToolbarRow>
          <ToolbarRow>
            <ColorMapMenu
              align="end"
              cmap={getColorMap(edbSettings.plots.cmap.name)}
              reversed={edbSettings.plots.cmap.reversed}
              onChange={(cmap, reversed) => {
                // store the cmap the user likes
                updateEdbSettings(
                  produce(edbSettings, (draft) => {
                    draft.plots.cmap = {
                      name: cmap.id as ColorMapName,
                      reversed,
                    }
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
