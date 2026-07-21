import { TEXT_OK, TEXT_OPEN_FILE } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { useEffect } from 'react'

import {
  ActionCheckRow,
  ActionDialogCard,
  ActionDialogRow,
} from '@/components/dialogs/card/action-dialog-card'
import {
  getHumanReadableDelimiter,
  humanReadableDelimiterToDelimiter,
  parseHumanReadableDelimiter,
  type HumanReadableDelimiter,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { VCenterRow } from '@/layout/v-center-row'
import { NumericalInput } from '@/themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import { useMatcalcSettings } from './settings/matcalc-settings'

export interface IProps {
  files: ITextFileOpen[]
  openFiles: (files: ITextFileOpen[], options: IParseOptions) => void
  onCancel: () => void
}

export function OpenTableDialog({ files, openFiles, onCancel }: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  useEffect(() => {
    if (files.length > 0) {
      const file = files[0]!

      updateSettings({
        ...settings,
        openFile: {
          ...settings.openFile,
          delimiter: getHumanReadableDelimiter(file),
        },
      })
    }
  }, [files])

  return (
    <OKCancelDialog
      open={files.length > 0}
      title={TEXT_OPEN_FILE}
      //contentVariant="glass"
      onResponse={(resp) => {
        if (resp === TEXT_OK) {
          openFiles(files, {
            colNames: settings.openFile.firstRowIsHeader ? 1 : 0,
            indexCols: settings.openFile.index.hasIndex
              ? settings.openFile.index.cols
              : 0,
            skipRows: settings.openFile.skipRows,
            delimiter: humanReadableDelimiterToDelimiter(
              parseHumanReadableDelimiter(settings.openFile.delimiter)
            ),
            trimWhitespace: settings.openFile.trimWhitespace,
            keepDefaultNA: settings.openFile.keepDefaultNA,
          })
        } else {
          onCancel()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <ActionDialogCard>
        <ActionDialogRow title="File">
          <Input value={files[0]!.name} readOnly />
        </ActionDialogRow>
        <ActionCheckRow
          title="Header"
          checked={settings.openFile.firstRowIsHeader}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.openFile.firstRowIsHeader = v
            })
            updateSettings(newSettings)
          }}
        />
        <ActionCheckRow
          title="Row index"
          checked={settings.openFile.index.hasIndex}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.openFile.index.hasIndex = v
            })
            updateSettings(newSettings)
          }}
          justify="start"
        >
          <NumericalInput
            value={settings.openFile.index.cols}
            disabled={!settings.openFile.index.hasIndex}
            placeholder="Columns..."
            className="w-16 rounded-theme"
            onNumChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.openFile.index.cols = v
              })

              updateSettings(newSettings)
            }}
          />
          <span>cols</span>
        </ActionCheckRow>

        <ActionDialogRow className="gap-x-2" title="Skip">
          <VCenterRow className="w-28 gap-x-2">
            <NumericalInput
              value={settings.openFile.skipRows}
              limit={[0, 1000]}
              placeholder="Rows..."
              className="w-16 rounded-theme"
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.openFile.skipRows = v
                })

                updateSettings(newSettings)
              }}
            />
            <span>rows</span>
          </VCenterRow>
        </ActionDialogRow>

        <ActionDialogRow title="Delimiter">
          {/* <Input
              value={settings.openFile.delimiter}
              onChange={e => {
                updateSettings({
                  ...settings,
                  openFile: {
                    ...settings.openFile,
                    delimiter: parseHumanReadableDelimiter(e.target.value),
                  },
                })
              }}
              className="w-24 rounded-theme"
            /> */}

          <Select
            defaultValue={settings.openFile.delimiter}
            onValueChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.openFile.delimiter = v as HumanReadableDelimiter
              })
              updateSettings(newSettings)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue data-placeholder="Select a delimiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<tab>">{'<tab>'}</SelectItem>
              <SelectItem value="<comma>">{'<comma>'}</SelectItem>
              <SelectItem value="<space>">{'<space>'}</SelectItem>
            </SelectContent>
          </Select>
        </ActionDialogRow>

        <ActionCheckRow
          title="Trim spaces"
          tooltip="If enabled, leading and trailing whitespace will be removed from each cell."
          checked={settings.openFile.trimWhitespace}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.openFile.trimWhitespace = v
            })
            updateSettings(newSettings)
          }}
        />

        <ActionCheckRow
          title="Keep default NA"
          checked={settings.openFile.keepDefaultNA}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.openFile.keepDefaultNA = v
            })
            updateSettings(newSettings)
          }}
        />
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
