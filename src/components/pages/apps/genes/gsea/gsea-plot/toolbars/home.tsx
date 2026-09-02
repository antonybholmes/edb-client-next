import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onBinaryFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'

import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { AxesSettingsPropsPopover } from '../../../../../../plot/axes/settings/axes-settings-props-popover'
import { useGsea } from '../gsea-plot-store'
import { useGseaSettings } from '../gsea-settings-store'

export function HomeToolbar() {
  const { settings, updateSettings } = useGseaSettings()
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
        <DoubleNumericalInput
          h="sm"
          v1={settings.axes.x.length}
          placeholder="Width"
          limit={[1, 1000]}
          dp={0}
          onNumChange1={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.axes.x.length = v
              })
            )
          }}
          v2={settings.es.axes.y.length}
          onNumChange2={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.es.axes.y.length = v
              })
            )
          }}
        />
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Options" className="gap-x-1">
        <ToolbarCol className="gap-x-1">
          <ToolbarRow gap="gap-x-1">
            Columns
            <NumericalInput
              value={settings.page.columns}
              h="sm"
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
          </ToolbarRow>

          <ToolbarButton
            checked={settings.phenotypes.invert}
            onClick={() =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.phenotypes.invert = !draft.phenotypes.invert
                })
              )
            }
            title="Switch the phenotypes to be plotted on the left and right side of the plot."
          >
            Invert Phenotypes
          </ToolbarButton>
        </ToolbarCol>
        <ToolbarCol>
          <ToolbarRow>
            <AxesSettingsPropsPopover />
          </ToolbarRow>
        </ToolbarCol>
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
