import { deepFreeze } from '@/lib/utils'
import {
  SaveAsDialog,
  type ISaveAsDialogProps,
  type ISaveAsFileType,
} from './save-as-dialog'

export const PNG_FILE_FORMAT: ISaveAsFileType = deepFreeze({
  name: 'PNG',
  ext: 'png',
})

export const SVG_FILE_FORMAT: ISaveAsFileType = deepFreeze({
  name: 'SVG',
  ext: 'svg',
})

export const IMAGE_FILE_FORMATS = deepFreeze([PNG_FILE_FORMAT, SVG_FILE_FORMAT])

export function SaveImageDialog({
  open = true,
  name = 'plot',
  fileTypes = IMAGE_FILE_FORMATS,
  onResponse = () => {},
}: ISaveAsDialogProps) {
  return (
    <SaveAsDialog
      open={open}
      title="Save Image As"
      name={name}
      onResponse={onResponse}
      fileTypes={fileTypes}
    />
  )
}
