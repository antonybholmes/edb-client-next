import {
  type ISaveAsDialogProps,
  type ISaveAsFileType,
  SaveAsDialog,
} from '@/dialogs/save-as-dialog'
import { FILE_FORMAT_JSON } from '@/dialogs/save-txt-dialog'

const GROUP_FILE_FORMATS: ISaveAsFileType[] = [
  FILE_FORMAT_JSON,
  { name: 'GSEA cls', ext: 'cls' },
]

export function SaveGroupsDialog({
  open = true,
  name = 'groups',
  onResponse = () => {},
}: ISaveAsDialogProps) {
  return (
    <SaveAsDialog
      open={open}
      title="Save Groups As"
      name={name}
      onResponse={onResponse}
      formats={GROUP_FILE_FORMATS}
    />
  )
}
