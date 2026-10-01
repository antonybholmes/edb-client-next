import { DownloadIcon } from '@/components/icons/download-icon'
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
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { produce } from 'immer'
import { RotateCw } from 'lucide-react'
import { ColorMapMenu } from '../../matcalc/color-map-menu'
import { NetworkDialog } from '../network-dialog'
import { useNetworkSettings } from '../network-settings-store'
import { useNetworkD3Sim } from '../network-store-d3-sim'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()
  const { settings, updateSettings } = useNetworkSettings()
  const { autoFit, runSim } = useNetworkD3Sim()

  const { openCustom: openCustomDialog } = useDialogs()

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
                  openDataFrames(files, { indexCols: 0 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('network')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Network">
        <ToolbarColSmallButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            console.log('Running plot action')
            openCustomDialog(NetworkDialog, {})
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColSmallButton>
        <ToolbarCol>
          <ToolbarRow>
            <ToolbarIconButton onClick={() => runSim()} title="Run Simulation">
              <RotateCw size={16} />
            </ToolbarIconButton>
          </ToolbarRow>
          <ToolbarRow>
            <ToolbarButton onClick={() => autoFit()}>Auto Fit</ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span className="w-3 text-center">W</span>
            <NumericalInput
              w="xxs"
              h="sm"

              value={settings.plot.size.w}
              placeholder="Width"
              limit={[1, 5000]}
              dp={0}
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.size.w = v
                  })
                )
              }}
            />
          </ToolbarRow>
          <ToolbarRow>
            <span className="w-3 text-center">H</span>
            <NumericalInput
              w="xxs"
              h="sm"
              value={settings.plot.size.h}
              placeholder="Height"
              limit={[1, 5000]}
              dp={0}

              onNumChange={(v) => {
                console.log('New height value:', v)
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.size.h = v
                  })
                )
              }}
            />
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarCol></ToolbarCol>
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Color">
        <ToolbarCol>
          <ToolbarRow>
            {/* <span>Mode</span> */}

            <ToggleGroup
              value={[settings.plot.nodes.color.mode]}
              onValueChange={(v) => {
                console.log('New color mode value:', v)
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.color.mode = v[0]! as 'auto' | 'group'
                  })
                )
              }}
              size="toolbar"
              //direction="toolbar"
            >
              <GroupToggle
                value="group"
                className="w-12"
                title="Color nodes by group"
              >
                Group
              </GroupToggle>
              <GroupToggle
                value="auto"
                className="w-12"
                title="Color nodes by metric"
              >
                Auto
              </GroupToggle>
            </ToggleGroup>
          </ToolbarRow>
          <ColorMapMenu
            cmap={getColorMap(settings.plot.nodes.color.cmap)}
            onChange={(cmap) => {
              // store the cmap the user likes
              console.log('New color map value:', cmap)
              updateSettings(
                produce(settings, (draft) => {
                  draft.plot.nodes.color.cmap.name = cmap.id as ColorMapName
                  draft.plot.nodes.color.cmap.reversed = cmap.isReversed
                })
              )
            }}
          />
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
