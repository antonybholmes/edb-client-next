import {
  onBinaryFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { DownloadIcon } from '@/components/icons/computer/download-icon'
import { ColorMapToolbarMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import {
  SelectItem,
  SelectList,
} from '@/components/shadcn/ui/themed/baseui/select'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'
import { getCmapFromColorMap, getColorMap } from '@/lib/color/colormap'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { MarginPopover } from '../display-props/margin-popover'
import { useGseaSettings } from '../gsea-settings'
import { useGsea } from '../gsea-store'

export function HomeToolbar() {
  const { settings, updateSettings } = useGseaSettings()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

  const { loadGseaZipWithErrorHandling } = useGsea()
  const { saveAs } = useSVG()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onBinaryFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }

                  loadGseaZipWithErrorHandling(files)
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('gsea')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size">
        <ToolbarCol>
          <ToolbarRow title="Width" smallTitle="W" titleCls="w-10">
            <NumericalInput
              h="toolbar"
              value={settings.es.axes.x.length}
              placeholder="Width"
              limit={[1, 1000]}
              dp={0}
              onNumChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.es.axes.x.length = v
                  })
                )
              }}
            />
          </ToolbarRow>
          <ToolbarRow title="Height" smallTitle="H" titleCls="w-10">
            <NumericalInput
              h="toolbar"
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
        </ToolbarCol>
        <MarginPopover button="flat" />
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Options" className="gap-x-1">
        <ToolbarCol className="gap-x-1">
          <ToolbarRow title="Columns" smallTitle="Cols">
            <NumericalInput
              value={settings.page.columns}
              h="toolbar"
              placeholder="Opacity"
              limit={[1, 100]}
              step={1}
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.page.columns = v
                  })
                )
              }}
              w="xxs"
            />
            {/* <PhenotypeModeList /> */}
            <ToolbarButton
              checked={settings.phenotypes.mode !== 'normal'}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.phenotypes.mode =
                      draft.phenotypes.mode === 'normal' ? 'inverted' : 'normal'
                  })
                )
              }}
            >
              Invert
            </ToolbarButton>
          </ToolbarRow>
          <ToolbarRow>
            <ColorMapToolbarMenu
              cmap={getColorMap(edbSettings.plots.cmap)}
              onChange={(cmap) => {
                updateEdbSettings(
                  produce(edbSettings, (draft) => {
                    draft.plots.cmap = getCmapFromColorMap(cmap)
                  })
                )
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.gradient.mode = 'cmap'
                  })
                )
              }}
            />

            <SelectList
              items={[
                { label: 'Score', value: 'score' },
                { label: 'Rank', value: 'rank' },
              ]}
              value={settings.genes.color.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.mode = value as 'score' | 'rank'
                  })
                )
              }}
              w="xs"
              variant="toolbar"
              title="Metric to use for coloring genes"
            >
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="rank">Rank</SelectItem>
            </SelectList>
          </ToolbarRow>
        </ToolbarCol>
        {/* <ToolbarCol>
          <ToolbarRow>
            <AxesSettingsPropsPopover />
          </ToolbarRow>
        </ToolbarCol> */}
      </ToolbarTabGroup>

      {/* <ToolbarTabGroup title="View">
        <ToggleGroup
          //direction="toolbar"
          className="overflow-hidden rounded-theme"
          //rounded="none"
          size="toolbar"
          value={[settings.view.tab]}
          onValueChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.view.tab = v[0] as 'gsea' | 'bubble'
              })
            )
          }}
        >
          <GroupToggle value="gsea" className="px-2">
            GSEA
          </GroupToggle>

          <GroupToggle value="bubble" className="px-2">
            Bubble
          </GroupToggle>
        </ToggleGroup>
      </ToolbarTabGroup> */}
    </>
  )
}
