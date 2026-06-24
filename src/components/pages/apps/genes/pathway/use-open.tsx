import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
} from '@/components/pages/open-files'
import { truncate } from '@/lib/text/text'
import { useHistory } from '../../matcalc/history/history-store'

export function useOpen() {
  const { openFile } = useHistory()

  function open(message: string, files: FileList | []) {
    onTextFileChange(message, files, (files) => {
      if (files.length > 0) {
        filesToDataFrames(files, {
          parseOpts: {
            ...DEFAULT_PARSE_OPTS,
            colNames: files[0]!.name.includes('gmx') ? 0 : 1,
            skipRows: files[0]!.name.includes('gmx') ? 1 : 0,
          },
          onSuccess: (tables) => {
            if (tables.length > 0) {
              const table = tables[0]!
              openFile(`Load ${table.name}`, {
                sheets: [table.setName(truncate(table.name, { length: 16 }))],
              })
            }
          },
        })
      }
    })
  }

  return { open }
}
