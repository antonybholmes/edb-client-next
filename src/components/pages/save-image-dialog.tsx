import { SaveAsDialog, type ISaveAsFormat } from './save-as-dialog'

export interface IProps {
  open: string
  onSave: (format: ISaveAsFormat) => void
  onCancel: () => void
}

export function SaveImageDialog({ open, onSave, onCancel }: IProps) {
  return (
    <SaveAsDialog
      open={open}
      title="Save image as"
      onSave={onSave}
      onCancel={onCancel}
      formats={[
        { name: 'PNG', ext: 'png' },
        { name: 'SVG', ext: 'svg' },
      ]}
    />
  )
}
