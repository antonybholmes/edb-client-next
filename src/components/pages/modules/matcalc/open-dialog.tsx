import { BaseCol } from '@/components/layout/base-col'

import { VCenterRow } from '@/components/layout/v-center-row'

import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { Checkbox } from '@components/shadcn/ui/themed/check-box'
import { useContext, useEffect } from 'react'

import { Card } from '@/components/shadcn/ui/themed/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import {
  getHumanReadableDelimiter,
  humanReadableDelimiterToDelimiter,
  parseHumanReadableDelimiter,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { Switch } from '@components/shadcn/ui/themed/switch'
import { MatcalcSettingsContext } from './matcalc-settings-provider'

export interface IProps {
  files: ITextFileOpen[]
  openFiles: (files: ITextFileOpen[], options: IParseOptions) => void
  onCancel: () => void
}

export function OpenDialog({ files, openFiles, onCancel }: IProps) {
  const { settings, updateSettings } = useContext(MatcalcSettingsContext)

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
      title="Open File"
      contentVariant="glass"
      onReponse={resp => {
        if (resp === TEXT_OK) {
          openFiles(files, {
            colNames: settings.openFile.firstRowIsHeader ? 1 : 0,
            indexCols: settings.openFile.firstColIsIndex ? 1 : 0,
            skipRows: 0,
            delimiter: humanReadableDelimiterToDelimiter(
              parseHumanReadableDelimiter(settings.openFile.delimiter)
            ),
            keepDefaultNA: settings.openFile.keepDefaultNA,
          })
        } else {
          onCancel()
        }
      }}
      //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
    >
      <Card>
        <Checkbox
          checked={settings.openFile.firstRowIsHeader}
          onCheckedChange={state => {
            updateSettings({
              ...settings,
              openFile: { ...settings.openFile, firstRowIsHeader: state },
            })
          }}
        >
          <span>First row is header</span>
        </Checkbox>
        <Checkbox
          checked={settings.openFile.firstColIsIndex}
          onCheckedChange={state => {
            updateSettings({
              ...settings,
              openFile: { ...settings.openFile, firstColIsIndex: state },
            })
          }}
        >
          <span>First column is index</span>
        </Checkbox>

        <BaseCol className="gap-y-2">
          {/* <h3 className="font-semibold">Separator Options</h3> */}
          <VCenterRow className="gap-x-4">
            <span>Delimiter</span>
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
              onValueChange={value => {
                updateSettings({
                  ...settings,
                  openFile: {
                    ...settings.openFile,
                    delimiter: parseHumanReadableDelimiter(value),
                  },
                })
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select a delimiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<tab>">{'<tab>'}</SelectItem>
                <SelectItem value="<comma>">{'<comma>'}</SelectItem>
                <SelectItem value="<space>">{'<space>'}</SelectItem>
              </SelectContent>
            </Select>
          </VCenterRow>
        </BaseCol>
        <Switch
          checked={settings.openFile.keepDefaultNA}
          onCheckedChange={state => {
            updateSettings({
              ...settings,
              openFile: { ...settings.openFile, keepDefaultNA: state },
            })
          }}
        >
          Keep default NA
        </Switch>
      </Card>
    </OKCancelDialog>
  )
}
