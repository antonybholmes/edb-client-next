import {
  SaveAsDialog,
  type ISaveAsDialogProps,
  type ISaveAsFormat,
} from './save-as-dialog'

export const PNG_FILE_FORMAT: ISaveAsFormat = { name: 'PNG', ext: 'png' }

export const IMAGE_FILE_FORMATS: ISaveAsFormat[] = [
  { name: 'PNG', ext: 'png' },
  { name: 'SVG', ext: 'svg' },
]

export function SaveImageDialog({
  open = true,
  name = 'plot',
  formats = IMAGE_FILE_FORMATS,
  onResponse = () => {},
}: ISaveAsDialogProps) {
  return (
    <SaveAsDialog
      open={open}
      title="Save Image As"
      name={name}
      onResponse={onResponse}
      formats={formats}
    />
  )
}
