import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { useEffect } from 'react'

import {
  getHumanReadableDelimiter,
  humanReadableDelimiterToDelimiter,
  parseHumanReadableDelimiter,
  type HumanReadableDelimiter,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { CheckPropRow } from '@dialog/check-prop-row'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { VCenterRow } from '@layout/v-center-row'
import { truncate } from '@lib/text/text'
import { NumericalInput } from '@themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import { produce } from 'immer'
import { useMatcalcSettings } from './settings/matcalc-settings'

export interface IProps {
  files: ITextFileOpen[]
  openFiles: (files: ITextFileOpen[], options: IParseOptions) => void
  onCancel: () => void
}

export function OpenDialog({ files, openFiles, onCancel }: IProps) {
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
      title={
        files.length > 0
          ? `Open ${truncate(files[0]!.name, { length: 50 })}`
          : 'Open File'
      }
      //contentVariant="glass"
      onResponse={resp => {
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
      <CheckPropRow
        title="Has header"
        checked={settings.openFile.firstRowIsHeader}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.openFile.firstRowIsHeader = v
          })
          updateSettings(newSettings)
        }}
      />
      <CheckPropRow
        title="Has row index"
        checked={settings.openFile.index.hasIndex}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.openFile.index.hasIndex = v
          })
          updateSettings(newSettings)
        }}
      >
        <VCenterRow className="w-32 gap-x-2">
          <NumericalInput
            value={settings.openFile.index.cols}
            disabled={!settings.openFile.index.hasIndex}
            placeholder="Columns..."
            className="w-16 rounded-theme"
            onNumChange={v => {
              const newSettings = produce(settings, draft => {
                draft.openFile.index.cols = v
              })
              console.log(newSettings)
              updateSettings(newSettings)
            }}
          />
          <span>cols</span>
        </VCenterRow>
      </CheckPropRow>

      <PropRow className="gap-x-2" title="Skip">
        <VCenterRow className="w-32 gap-x-2">
          <NumericalInput
            value={settings.openFile.skipRows}
            limit={[0, 1000]}
            placeholder="Rows..."
            className="w-16 rounded-theme"
            onNumChange={v => {
              const newSettings = produce(settings, draft => {
                draft.openFile.skipRows = v
              })

              updateSettings(newSettings)
            }}
          />
          <span>rows</span>
        </VCenterRow>
      </PropRow>

      <PropRow title="Delimiter">
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
          onValueChange={v => {
            const newSettings = produce(settings, draft => {
              draft.openFile.delimiter = v as HumanReadableDelimiter
            })
            updateSettings(newSettings)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select a delimiter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="<tab>">{'<tab>'}</SelectItem>
            <SelectItem value="<comma>">{'<comma>'}</SelectItem>
            <SelectItem value="<space>">{'<space>'}</SelectItem>
          </SelectContent>
        </Select>

        <CheckPropRow
          title="Trim spaces"
          tooltip="If enabled, leading and trailing whitespace will be removed from each cell."
          checked={settings.openFile.trimWhitespace}
          onCheckedChange={v => {
            const newSettings = produce(settings, draft => {
              draft.openFile.trimWhitespace = v
            })
            updateSettings(newSettings)
          }}
        />
      </PropRow>

      <SwitchPropRow
        title="Keep default NA"
        checked={settings.openFile.keepDefaultNA}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.openFile.keepDefaultNA = v
          })
          updateSettings(newSettings)
        }}
      />
    </OKCancelDialog>
  )
}
