import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { produce } from 'immer'
import { ColorMapMenu } from '../../matcalc/color-map-menu'
import { NetworkDialog } from '../network-dialog'
import { useNetworkSettings } from '../network-settings-store'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()
  const { settings, updateSettings } = useNetworkSettings()

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
        <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openCustomDialog(NetworkDialog, {})
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size">
        <DoubleNumericalInput
          h="sm"
          w="xs"
          v1={settings.plot.size.w}
          placeholder="Width"
          limit={[1, 5000]}
          dp={0}
          onNumChanged1={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.size.w = v
              })
            )
          }}
          v2={settings.plot.size.h}
          onNumChanged2={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.size.h = v
              })
            )
          }}
        />
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Options">
        <ToolbarCol>
          <ToolbarRow>
            <span>Color Mode</span>
            <SelectList
              items={[
                {
                  value: 'auto',
                  label: 'Auto',
                },
                {
                  value: 'group',
                  label: 'Group',
                },
              ]}
              value={settings.plot.nodes.color.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.color.mode = value as 'auto' | 'group'
                  })
                )
              }}
              w="xs"
              variant="toolbar"
            >
              {[
                {
                  value: 'auto',
                  label: 'Auto',
                },
                {
                  value: 'group',
                  label: 'Group',
                },
              ].map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.label}
                </SelectItem>
              ))}
            </SelectList>
          </ToolbarRow>
          <ColorMapMenu
            cmap={getColorMap(settings.plot.nodes.color.cmap)}
            onChange={(cmap) => {
              // store the cmap the user likes
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
