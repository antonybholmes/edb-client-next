import { useDialogs } from '@/components/dialogs/dialogs'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_DOWNLOAD } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { useOpenFiles } from '../../matcalc/hooks/open'
import { useMatcalcDialogs } from '../../matcalc/matcalc-dialogs'
import { useSankey } from '../sankey-provider'

export function HomeToolbar() {
  const { svgRef } = useSVG()
  const { open: openDialog } = useDialogs()
  const { openDataFrames } = useOpenFiles()
  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { setPlot } = useSankey()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) =>
                  openDataFrames(files)
                )
              },
            })
          }}
        />
        <ToolbarCol>
          <ToolbarRow>
            <ToolbarColSmallButton
              title="Download table to device"
              onClick={() => {
                openDialog({
                  type: 'save-image',
                  payload: {
                    name: 'sankey',
                    svgRef,
                  },
                })
              }}
              icon={<DownloadImageIcon />}
            >
              {TEXT_DOWNLOAD}
            </ToolbarColSmallButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title-="Sankey">
        <ToolbarButton
          title="Sankey"
          onClick={() => {
            openMatcalcDialog({
              type: 'sankey-plot',
              payload: {
                callback: (plot) => {
                  console.log('Sankey dialog returned plot', plot)
                  setPlot(plot)
                },
              },
            })
          }}
        >
          <PlayIcon variant="app-theme" /> Plot
        </ToolbarButton>
      </ToolbarTabGroup>
    </>
  )
}
