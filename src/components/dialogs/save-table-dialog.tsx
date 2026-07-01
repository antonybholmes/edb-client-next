import { useEdbSettings } from '@/components/edb/edb-settings'
import { TEXT_CANCEL, TEXT_NAME } from '@/consts'
import { UndefStr } from '@/lib/text/text'
import { produce } from 'immer'
import { useEffect, useState } from 'react'
import { BaseCol } from '../layout/base-col'
import { Checkbox } from '../shadcn/ui/themed/v2/check-box'
import { IModalProps, OKCancelDialog } from './ok-cancel-dialog'
import { ISaveAsResponse, type ISaveAsFileType } from './save-as-dialog'
import { TXT_FILE_FORMATS } from './save-txt-dialog'
import { TextPropRow } from './text-prop-row'

export const FILE_FORMAT_JSON = { name: 'JSON', ext: 'json' }
export const TAB_DELIMITED_FORMAT = { name: 'Tab Delimited', ext: 'txt' }
export const CSV_FORMAT = { name: 'Comma Separated', ext: 'csv' }

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
      buttons={fileTypes.map((format) => format.ext.toUpperCase())}
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
      <TextPropRow
        title={TEXT_NAME}
        value={text}
        placeholder="Save as..."
        onTextChange={(e) => {
          setText(e)
        }}
      />

      <BaseCol className="gap-y-2 ml-14">
        <Checkbox
          checked={hasHeader}
          onCheckedChange={(e) => {
            setHasHeader(e)
            updateSettings(
              produce(settings, (draft) => {
                draft.save.table.hasHeader = e
              })
            )
          }}
        >
          Has header
        </Checkbox>

        <Checkbox
          checked={hasIndex}
          onCheckedChange={(e) => {
            setHasIndex(e)
            updateSettings(
              produce(settings, (draft) => {
                draft.save.table.hasIndex = e
              })
            )
          }}
        >
          Has index
        </Checkbox>
      </BaseCol>

      {/* <CheckPropRow
        title="Has header"
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

      <CheckPropRow
        title="Has index"
        checked={hasIndex}
        onCheckedChange={(e) => {
          setHasIndex(e)
          updateSettings(
            produce(settings, (draft) => {
              draft.save.table.hasIndex = e
            })
          )
        }}
      /> */}
    </OKCancelDialog>
  )
}
