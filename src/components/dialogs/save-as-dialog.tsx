import { TEXT_CANCEL, TEXT_NAME, TEXT_SAVE_AS } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import type { UndefStr } from '@/lib/text/text'
import { useState } from 'react'
import { TextPropRow } from './text-prop-row'

export interface ISaveAsFileType {
  name: string
  ext: string
}

export interface ISaveAsResponse {
  name: string
  format: ISaveAsFileType
}

export interface ISaveAsDialogProps extends IModalProps<ISaveAsResponse> {
  name?: UndefStr
  fileTypes?: readonly ISaveAsFileType[] | undefined
}

export function SaveAsDialog({
  open = true,
  title = TEXT_SAVE_AS,
  name = 'file',
  fileTypes = [],
  onResponse,
}: ISaveAsDialogProps) {
  const [text, setText] = useState(name)

  return (
    <OKCancelDialog
      open={open}
      title={title}
      //buttons={[...formats.map(format => format.ext), TEXT_CANCEL]}
      buttons={fileTypes.map(format => format.ext.toUpperCase())}
      onResponse={response => {
        if (response !== TEXT_CANCEL) {
          const format = fileTypes.filter(
            f => f.ext.toUpperCase() === response
          )[0]!

          //console.log('Save as...', text, format)

          onResponse?.(response, {
            name: `${text.split('.')[0]}.${response.toLowerCase()}`,
            format,
          } as ISaveAsResponse)
        } else {
          onResponse?.(response, undefined)
        }
      }}
    >
      <TextPropRow
        title={TEXT_NAME}
        value={text}
        placeholder="Save as..."
        onTextChange={e => {
          setText(e)
        }}
      />
    </OKCancelDialog>
  )
}
