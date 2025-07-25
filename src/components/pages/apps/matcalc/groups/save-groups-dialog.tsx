import {
  type ISaveAsDialogProps,
  type ISaveAsFormat,
  SaveAsDialog,
} from '@components/pages/save-as-dialog'
import { FILE_FORMAT_JSON } from '@components/pages/save-txt-dialog'

const GROUP_FILE_FORMATS: ISaveAsFormat[] = [
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
