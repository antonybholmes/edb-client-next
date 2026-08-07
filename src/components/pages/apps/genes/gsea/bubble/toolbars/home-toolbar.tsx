import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import { useMatcalcDialogs } from '@/components/pages/apps/matcalc/matcalc-dialogs'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { IGseaBubblePlot, useGseaBubbleContext } from '../gsea-bubble-provider'
import { useGseaBubbleSettings } from '../gsea-bubble-settings-store'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { open: openMatcalcDialog } = useMatcalcDialogs()
  const { settings, updateSettings } = useGseaBubbleSettings()
  const { openDataFrames } = useOpenFiles()
  const { svgRef } = useSVG()
  const { setPlot } = useGseaBubbleContext()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) =>
                  openDataFrames(files, { indexCols: 1 })
                )
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
                name: 'gsea-bubble',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title-="GSEA Bubble">
        <ToolbarButton
          title="GSEA Bubble"
          onClick={() => {
            openMatcalcDialog({
              type: 'gsea-bubble-plot',
              payload: {
                callback: (plot) => {
                  console.log('GSEA Bubble dialog returned plot', plot)
                  setPlot(plot as IGseaBubblePlot)
                },
              },
            })
          }}
        >
          <PlayIcon variant="app-theme" /> Plot
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Width">
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
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Row Height">
        <NumericalInput
          h="md"
          value={settings.axes.y.rowHeight}
          placeholder="Row Height"
          limit={[1, 1000]}
          dp={0}
          onNumChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.axes.y.rowHeight = v
              })
            )
          }}
        />
      </ToolbarTabGroup>
    </>
  )
}
