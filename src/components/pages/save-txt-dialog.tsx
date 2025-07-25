import { TEXT_SAVE_AS } from '@/consts'
import {
  SaveAsDialog,
  type ISaveAsDialogProps,
  type ISaveAsFormat,
} from './save-as-dialog'

export const FILE_FORMAT_JSON = { name: 'JSON', ext: 'json' }

export const TXT_FILE_FORMATS: ISaveAsFormat[] = [
  { name: 'Tab Delimited', ext: 'txt' },
  { name: 'Comma Separated', ext: 'csv' },
]

export function SaveTxtDialog({
  open = true,
  title = TEXT_SAVE_AS,
  name = 'data',
  formats = TXT_FILE_FORMATS,
  onResponse = () => {},
}: ISaveAsDialogProps) {
  return (
    <SaveAsDialog
      open={open}
      title={title}
      name={name}
      formats={formats}
      onResponse={onResponse}
    />
  )
}
