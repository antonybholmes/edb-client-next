import type { IElementProps } from '@interfaces/element-props'
import { SaveAsDialog, type ISaveAsFormat } from './save-as-dialog'

export interface IProps extends IElementProps {
  open?: string

  onSave: (format: ISaveAsFormat) => void
  onCancel: () => void
}

export function SaveTxtDialog({
  open = 'open',
  title = 'Save table as',
  onSave,
  onCancel,
}: IProps) {
  return (
    <SaveAsDialog
      open={open}
      title={title}
      onSave={onSave}
      onCancel={onCancel}
      formats={[
        { name: 'Tab Delimited', ext: 'txt' },
        { name: 'Comma Separated', ext: 'csv' },
      ]}
    />
  )
}
