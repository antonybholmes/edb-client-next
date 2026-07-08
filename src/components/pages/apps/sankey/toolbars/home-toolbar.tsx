import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_DOWNLOAD } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { useOpenFiles } from '../../matcalc/hooks/open'
import { useMatcalcDialogs } from '../../matcalc/matcalc-dialogs'
import { useSankey } from '../sankey-provider'
import { useSankeySettings } from '../sankey-settings-store'

export function HomeToolbar() {
  const { svgRef } = useSVG()
  const { open: openDialog } = useDialogs()
  const { openDataFrames } = useOpenFiles()
  const { open: openMatcalcDialog } = useMatcalcDialogs()
  const { settings, updateSettings } = useSankeySettings()
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
      <ToolbarTabGroup title="Plot">
        <DoubleNumericalInput
          h="sm"
          v1={settings.width}
          v2={settings.height}
          onNumChange1={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.width = v
              })
            )
          }}
          onNumChange2={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.height = v
              })
            )
          }}
          dp={0}
          limit={[100, 2000]}
        />
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Links">
        <SelectList
          variant="toolbar"
          items={[
            { value: 'gradient', label: 'Gradient' },
            { value: 'static', label: 'Static' },
            { value: 'source', label: 'Source' },
            { value: 'target', label: 'Target' },
          ]}
          value={settings.links.colorMode}
          onValueChange={(value) => {
            const color = value as 'gradient' | 'static' | 'source' | 'target'
            updateSettings(
              produce(settings, (draft) => {
                draft.links.colorMode = color
              })
            )
          }}

          w="sm"
        >
          <SelectItem value="gradient">Gradient</SelectItem>
          <SelectItem value="static">Static</SelectItem>
          <SelectItem value="source">Source</SelectItem>
          <SelectItem value="target">Target</SelectItem>
        </SelectList>

        <FillButton
          colors={[
            {
              color: settings.links.color,
              opacity: settings.links.opacity,
              onColorChange: ({ color, opacity }) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.links.color = color
                    draft.links.opacity = opacity ?? 1
                  })
                )
              },
            },
          ]}

          title="Links Fill"
        />
      </ToolbarTabGroup>
    </>
  )
}
