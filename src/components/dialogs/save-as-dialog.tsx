import { TEXT_CANCEL, TEXT_NAME, TEXT_SAVE_AS } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import type { UndefStr } from '@/lib/text/text'
import { useState } from 'react'
import { Input } from '../shadcn/ui/themed/v2/input'
import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
} from './card/action-dialog-card'

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
  children,
}: ISaveAsDialogProps) {
  const [text, setText] = useState(name)

  return (
    <OKCancelDialog
      open={open}
      title={title}
      //buttons={[...formats.map(format => format.ext), TEXT_CANCEL]}
      buttons={fileTypes.map((f) => ({
        name: f.name,
        value: f.ext.toLowerCase(),
      }))}
      onResponse={(response) => {
        if (response !== TEXT_CANCEL) {
          const format = fileTypes.filter(
            (f) => f.ext.toLowerCase() === response
          )[0]!

          onResponse?.(response, {
            name: `${text.split('.')[0]}.${format.ext}`,
            format,
          })
        } else {
          onResponse?.(response, undefined)
        }
      }}
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title={TEXT_NAME}>
            <Input
              value={text}
              placeholder="Save as..."
              onTextChange={(e) => {
                setText(e)
              }}
              h="lg"
            />
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      {children && children}
    </OKCancelDialog>
  )
}
