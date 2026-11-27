import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { VolcanoDialog } from '../volcano-dialog'

import { DownloadImageIcon } from '@/components/icons/computer/download-image-icon'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { produce } from 'immer'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { MarginPopover } from '../props/margin-popover'
import {
  DEFAULT_VOLCANO_PROPS,
  IVolcanoDisplayOptions,
} from '../volcano-plot-svg'
import { useVolcanoContext } from '../volcano-provider'
import { useVolcanoSettings } from '../volcano-settings'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()
  const { addPlots } = useHistory()
  const { settings, updateSettings } = useVolcanoSettings()
  const { updatePlot } = useHistory()

  const { plot } = useVolcanoContext()
  const { openCustom: openCustomDialog } = useDialogs()

  const displayProps: IVolcanoDisplayOptions = plot?.props ?? {
    ...DEFAULT_VOLCANO_PROPS,
  }

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
            saveAs('volcano')
          }}
        >
          <DownloadImageIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Volcano">
        <ToolbarColSmallButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openCustomDialog(VolcanoDialog, {
              callback: (plot) => {
                addPlots([plot])
              },
            })
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColSmallButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow title="Width" titleCls="w-10" smallTitle="W">
            <NumericalInput
              h="toolbar"
              value={settings.axes.xaxis.length}
              placeholder="Width"
              limit={[1, 1000]}
              dp={0}
              onNumChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.xaxis.length = v
                  })
                )
              }}
            />
          </ToolbarRow>
          <ToolbarRow title="Height" titleCls="w-10" smallTitle="H">
            <NumericalInput
              h="toolbar"
              value={settings.axes.yaxis.length}
              placeholder="Row Height"
              limit={[1, 1000]}
              dp={0}
              onNumChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.yaxis.length = v
                  })
                )
              }}
            />
          </ToolbarRow>
        </ToolbarCol>
        <MarginPopover button="flat" />
      </ToolbarTabGroup>
    </>
  )
}
