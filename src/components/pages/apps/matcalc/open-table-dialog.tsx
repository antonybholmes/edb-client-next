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

      updateSettings(
        produce(settings, (draft) => {
          draft.files.open.delimiter = getHumanReadableDelimiter(file)
        })
      )
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
            colNames: settings.files.open.firstRowIsHeader ? 1 : 0,
            indexCols: settings.files.open.index.hasIndex
              ? settings.files.open.index.cols
              : 0,
            skipRows: settings.files.open.skipRows,
            delimiter: humanReadableDelimiterToDelimiter(
              parseHumanReadableDelimiter(settings.files.open.delimiter)
            ),
            trimWhitespace: settings.files.open.trimWhitespace,
            keepDefaultNA: settings.files.open.keepDefaultNA,
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
          checked={settings.files.open.firstRowIsHeader}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.files.open.firstRowIsHeader = v
            })
            updateSettings(newSettings)
          }}
        />
        <ActionCheckRow
          title="Row index"
          checked={settings.files.open.index.hasIndex}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.files.open.index.hasIndex = v
            })
            updateSettings(newSettings)
          }}
          justify="start"
        >
          <NumericalInput
            value={settings.files.open.index.cols}
            disabled={!settings.files.open.index.hasIndex}
            placeholder="Columns..."
            className="w-16 rounded-theme"
            onNumChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.files.open.index.cols = v
              })

              updateSettings(newSettings)
            }}
          />
          <span>cols</span>
        </ActionCheckRow>

        <ActionDialogRow className="gap-x-2" title="Skip">
          <VCenterRow className="w-28 gap-x-2">
            <NumericalInput
              value={settings.files.open.skipRows}
              limit={[0, 1000]}
              placeholder="Rows..."
              className="w-16 rounded-theme"
              onNumChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.files.open.skipRows = v
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
            defaultValue={settings.files.open.delimiter}
            onValueChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.files.open.delimiter = v as HumanReadableDelimiter
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
          checked={settings.files.open.trimWhitespace}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.files.open.trimWhitespace = v
            })
            updateSettings(newSettings)
          }}
        />

        <ActionCheckRow
          title="Keep default NA"
          checked={settings.files.open.keepDefaultNA}
          onCheckedChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.files.open.keepDefaultNA = v
            })
            updateSettings(newSettings)
          }}
        />
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
