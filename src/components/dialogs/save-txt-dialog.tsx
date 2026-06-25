import { TEXT_CANCEL, TEXT_SAVE_AS } from '@/consts'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { produce } from 'immer'
import {
  SaveAsDialog,
  type ISaveAsDialogProps,
  type ISaveAsFileType,
} from './save-as-dialog'

export const FILE_FORMAT_JSON = { name: 'JSON', ext: 'json' }
export const TAB_DELIMITED_FORMAT = { name: 'Tab Delimited', ext: 'txt' }
export const CSV_FORMAT = { name: 'Comma Separated', ext: 'csv' }

export const TXT_FILE_FORMATS: ISaveAsFileType[] = [
  TAB_DELIMITED_FORMAT,
  CSV_FORMAT,
]

interface ISaveTxtDialogProps extends ISaveAsDialogProps {
  tableMode?: boolean
}

export function SaveTxtDialog({
  open = true,
  title = TEXT_SAVE_AS,
  name,
  fileTypes = TXT_FILE_FORMATS,
  onResponse = () => {},
  tableMode = false,
}: ISaveTxtDialogProps) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <SaveAsDialog
      open={open}
      title={title}
      name={name ?? settings.save.filetypes.txt.name}
      fileTypes={fileTypes}
      ext={tableMode ? 'Table' : undefined}
      onResponse={(response, data) => {
        if (response !== TEXT_CANCEL) {
          const name = data!.name.split('.')[0]
          updateSettings(
            produce(settings, (draft) => {
              draft.save.filetypes.txt.name = name
            })
          )
        }

        onResponse?.(response, data)
      }}
    />
  )
}
