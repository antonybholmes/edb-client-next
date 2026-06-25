import {
  filesToDataFrames,
  IParseOptions,
  ITextFileOpen,
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { textToLines } from '@/lib/text/lines'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'

export function useOpen() {
  const { openFile, addSheets } = useHistory()

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    console.log('Opening files:', files)
    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
        }
      },
    })

    //setShowFileMenu(false)
  }

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('locations')) {
      const lines = textToLines(text)

      const locationTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      addSheets([locationTable.setName('Locations')], { mode: 'append' })
    } else {
      //setFilesToOpen([
      //  { name: "Variants", text, ext: name.split(".").pop() || "" },
      //])

      openFiles(
        [
          {
            name: 'Variants',
            text,
            ext: name.split('.').pop() || '',
          },
        ],
        {
          colNames: 1,
          indexCols: 0,
          delimiter: '\t',
          keepDefaultNA: false,
          skipRows: 0,
        }
      )
    }
    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }
  }

  function open(message: string) {
    openFilesDialog({
      message,
      onFileChange: (message, files) => {
        onTextFileChange(message, files, (files) => parseFiles(message, files))
      },
    })
  }

  return {
    open,
  }
}
