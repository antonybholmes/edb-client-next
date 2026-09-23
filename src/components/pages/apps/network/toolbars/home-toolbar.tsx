import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { ColorMapToolbarMenu } from '@/components/pages/apps/matcalc/color-map-menu'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import {
  TEXT_OPTIONS,
  TEXT_PLOT,
  TEXT_SAVE_IMAGE,
  TEXT_SORT_BY,
} from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'

import { useDialogs } from '@/components/dialogs/dialogs'
import {
  SortBy,
  useGseaBubbleSettings,
} from '../../genes/gsea/gsea-plot/bubble/gsea-bubble-settings-store'
import { NetworkDialog, SORT_BY_ITEMS } from '../network-dialog'

export function HomeToolbar() {
  const { settings, updateSettings } = useGseaBubbleSettings()
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

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
                  openDataFrames(files, { indexCols: 1 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('gsea-bubble')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Bubble">
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

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarRow title="Width">
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
        </ToolbarRow>
        <ToolbarRow title="Row Height">
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
        </ToolbarRow>
      </ToolbarTabGroup>
      <ToolbarTabGroup title={TEXT_OPTIONS} className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow title={TEXT_SORT_BY}>
            <SelectList
              items={SORT_BY_ITEMS}
              onValueChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.sortBy = v as SortBy
                  })
                )
              }
              value={settings.sortBy}
              w="sm"
            >
              {SORT_BY_ITEMS.map((item) => (
                <SelectItem value={item.value} key={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectList>
          </ToolbarRow>
          <ColorMapToolbarMenu
            cmap={getColorMap(settings.scale.cmap)}
            onChange={(cmap) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.scale.cmap = cmap.id as ColorMapName
                })
              )
            }}
          />
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
