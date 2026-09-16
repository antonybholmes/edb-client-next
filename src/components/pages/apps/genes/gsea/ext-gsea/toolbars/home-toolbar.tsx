import { DownloadIcon } from '@/components/icons/download-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_OPTIONS, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { ColorMapToolbarMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { PhenotypeModeList } from '../../gsea-plot/display-props/phenotype-mode'
import { useGseaSettings } from '../../gsea-plot/gsea-settings-store'
import { useExtGseaSettings } from '../ext-gsea-settings'

export function HomeToolbar() {
  const { settings, updateSettings } = useExtGseaSettings()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()
  const { settings: gseaSettings, updateSettings: updateGseaSettings } =
    useGseaSettings()

  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openDataFrames(files, { indexCols: 1 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('ext-gsea')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      {/*<ToolbarTabGroup title="Ext GSEA">
         <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openCustomDialog(ExtGseaInputDialog, {})
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColButton>
      </ToolbarTabGroup> */}

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarRow title="Width">
          <NumericalInput
            h="md"
            value={settings.axes.x.length}
            placeholder="Width"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.axes.x.length = v
                })
              )
            }}
          />
        </ToolbarRow>
        <ToolbarRow title="ES Height">
          <NumericalInput
            h="md"
            value={settings.es.axes.y.length}
            placeholder="Height"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.es.axes.y.length = v
                })
              )
            }}
          />
        </ToolbarRow>
      </ToolbarTabGroup>
      <ToolbarTabGroup title={TEXT_OPTIONS}>
        <ToolbarCol>
          <ToolbarRow>
            <span>Mode</span>
            <PhenotypeModeList />
          </ToolbarRow>
          <ToolbarRow>
            <ColorMapToolbarMenu
              cmap={getColorMap(edbSettings.plots.cmap)}
              onChange={(cmap, reversed) => {
                updateEdbSettings(
                  produce(edbSettings, (draft) => {
                    draft.plots.cmap.name = cmap.id as ColorMapName
                    draft.plots.cmap.reversed = reversed
                  })
                )
              }}
            />
            <SelectList
              items={[
                { label: 'Score', value: 'score' },
                { label: 'Rank', value: 'rank' },
              ]}
              value={gseaSettings.genes.color.mode}
              onValueChange={(value) => {
                updateGseaSettings(
                  produce(gseaSettings, (draft) => {
                    draft.genes.color.mode = value as 'score' | 'rank'
                  })
                )
              }}
              w="xs"
              variant="toolbar"
            >
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="rank">Rank</SelectItem>
            </SelectList>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
