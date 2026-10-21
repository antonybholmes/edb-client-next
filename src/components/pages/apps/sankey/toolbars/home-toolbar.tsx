import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { DownloadIcon } from '@/components/icons/computer/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import {
  SelectItem,
  SelectList,
} from '@/components/shadcn/ui/themed/baseui/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { useOpenFiles } from '../../matcalc/hooks/open'
import { useMatcalcDialogs } from '../../matcalc/matcalc-dialogs'
import { useSankey } from '../sankey-provider'
import { useSankeySettings } from '../sankey-settings-store'

export function HomeToolbar() {
  const { saveAs } = useSVG()
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
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openDataFrames(files)
                })
              },
            })
          }}
        />
        <ToolbarCol>
          <ToolbarRow>
            <ToolbarIconButton
              title="Download table to device"
              onClick={() => {
                saveAs('sankey')
              }}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title-="Sankey">
        <ToolbarColSmallButton
          title="Sankey"
          icon={<PlayIcon variant="app-theme" />}
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
          <PlayIcon variant="app-theme" />
          <span>Plot</span>
        </ToolbarColSmallButton>
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Plot">
        <DoubleNumericalInput
          h="toolbar"
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
        <ToolbarCol>
          <ToolbarRow>
            <span>Color</span>
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
                const color = value as
                  'gradient' | 'static' | 'source' | 'target'
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
          </ToolbarRow>
          <FillButton
            button="flat"
            colors={[
              {
                color: settings.links.fill.value,
                opacity: settings.links.fill.opacity,
                allowNoColor: false,
                onColorChange: ({ color, opacity }) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.links.fill.value = color
                      draft.links.fill.opacity = opacity ?? 1
                    })
                  )
                },
              },
            ]}

            title="Links Fill"
          />
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
