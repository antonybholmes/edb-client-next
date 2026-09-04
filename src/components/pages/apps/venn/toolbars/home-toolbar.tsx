import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarSeparator } from '@/components/toolbar/toolbar-separator'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'
import { useOpen } from '../use-open'
import { useVennSettings } from '../venn-settings-store'

export function HomeToolbar() {
  const { openFiles } = useOpen()
  const { saveAs } = useSVG()
  const { settings, updateSettings } = useVennSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) =>
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openFiles(files)
                }),
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('venn')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Heatmap" className="gap-x-2">
        <ToolbarCol gap="gap-x-2">
          <ToolbarRow>
            <Checkbox
              checked={settings.cluster.rows.on}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.cluster.rows.on = checked as boolean
                  })
                )
              }}
            >
              Cluster rows
            </Checkbox>
          </ToolbarRow>
          <ToolbarRow>
            <Checkbox
              checked={settings.cluster.cols.on}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.cluster.cols.on = checked as boolean
                  })
                )
              }}
            >
              Cluster columns
            </Checkbox>
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarSeparator />
        <ToolbarRow>
          Z-score
          <SelectList
            variant="toolbar"
            w="sm"
            value={settings.cluster.zscore}
            items={[
              { value: 'row', label: 'Row' },
              { value: 'col', label: 'Column' },
              { value: 'all', label: 'All' },
              { value: 'none', label: 'None' },
            ]}
            onValueChange={(value) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.cluster.zscore = value as 'row' | 'col' | 'all' | 'none'
                })
              )
            }}
          >
            <SelectItem value="row">Row</SelectItem>
            <SelectItem value="col">Column</SelectItem>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectList>
        </ToolbarRow>
      </ToolbarTabGroup>
    </>
  )
}
