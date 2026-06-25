import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onBinaryFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { useGseaPlotStore } from '../gsea-plot-store'
import { useGseaSettings } from '../gsea-settings-store'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { settings, updateSettings } = useGseaSettings()
  const { loadGseaZip } = useGseaPlotStore()
  const { svgRef } = useSVG()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onBinaryFileChange(message, files, loadGseaZip)
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'gsea',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size">
        <DoubleNumericalInput
          h="md"
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

      <ToolbarTabGroup title="Columns">
        <NumericalInput
          value={settings.page.columns}
          h="md"
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
          className="w-16 rounded-theme"
        />
      </ToolbarTabGroup>
    </>
  )
}
