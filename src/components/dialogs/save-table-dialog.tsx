import { useEdbSettings } from '@/components/edb/edb-settings'
import { TEXT_CANCEL, TEXT_NAME } from '@/consts'
import { UndefStr } from '@/lib/text/text'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { Input } from '../shadcn/ui/themed/v2/input'
import {
  ActionCheckRow,
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from './card/action-dialog-card'
import { IModalProps, OKCancelDialog } from './ok-cancel-dialog'
import { ISaveAsResponse, type ISaveAsFileType } from './save-as-dialog'
import { TXT_FILE_FORMATS } from './save-txt-dialog'

// export const FILE_FORMAT_JSON = { name: 'JSON', ext: 'json' }
// export const TAB_DELIMITED_FORMAT = { name: 'Tab Delimited', ext: 'txt' }
// export const CSV_FORMAT = { name: 'Comma Separated', ext: 'csv' }

export interface ISaveTableResponse extends ISaveAsResponse {
  hasHeader: boolean
  hasIndex: boolean
}

export interface ISaveTableDialogProps extends IModalProps<ISaveTableResponse> {
  name?: UndefStr
  fileTypes?: readonly ISaveAsFileType[] | undefined
}

export function SaveTableDialog({
  open = true,
  title = 'Save Table As',
  name = 'table',
  fileTypes = TXT_FILE_FORMATS,
  onResponse,
}: ISaveTableDialogProps) {
  const [text, setText] = useState(name)
  const [hasHeader, setHasHeader] = useState(true)
  const [hasIndex, setHasIndex] = useState(true)
  const { settings, updateSettings } = useEdbSettings()

  useEffect(() => {
    setHasHeader(settings.save.table.hasHeader)
    setHasIndex(settings.save.table.hasIndex)
  }, [settings])

  return (
    <OKCancelDialog
      open={open}
      title={title}
      buttons={fileTypes.map(
        (format) => format.name || format.ext.toUpperCase()
      )}
      buttonOrder="vertical"
      onResponse={(response) => {
        if (response !== TEXT_CANCEL) {
          const format = fileTypes.filter(
            (f) => f.ext.toUpperCase() === response
          )[0]!

          onResponse?.(response, {
            name: `${text.split('.')[0]}.${response.toLowerCase()}`,
            format,
            hasHeader,
            hasIndex,
          })
        } else {
          onResponse?.(response, undefined)
        }
      }}
      bodyCls="gap-y-4"
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title={TEXT_NAME}>
            <Input
              h="lg"
              value={text}
              placeholder="Save as..."
              onTextChange={(e) => {
                setText(e)
              }}
            />
          </ActionDialogRow>

          <ActionCheckRow
            title="Has Header"
            checked={hasHeader}
            onCheckedChange={(e) => {
              setHasHeader(e)
              updateSettings(
                produce(settings, (draft) => {
                  draft.save.table.hasHeader = e
                })
              )
            }}
          />

          <ActionCheckRow
            title="Has Index"
            checked={hasIndex}
            onCheckedChange={(e) => {
              setHasIndex(e)
              updateSettings(
                produce(settings, (draft) => {
                  draft.save.table.hasIndex = e
                })
              )
            }}
          />
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
