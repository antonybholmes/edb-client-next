import { useDialogs } from '@/components/dialogs/dialogs'
import {
  filesToDataFrames,
  IParseOptions,
  ITextFileOpen,
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { textToLines } from '@/lib/text/lines'
import { produce } from 'immer'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { makeClinicalTracks } from './clinical-utils'
import { useOncoplotSettings } from './oncoplot-settings-store'
import { useOncoplot } from './oncoplot-store'

export function useOpen() {
  const { openFile, addSheets } = useHistory()
  const { setClinicalTracks, setGenesFromTable } = useOncoplot()
  const { open: openDialog } = useDialogs()
  const { displayProps, setDisplayProps } = useOncoplotSettings()

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    //filesToDataFrames(files, historyDispatch, options)

    console.log('Parsing files with options:', files)

    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })

          setGenesFromTable(tables[0]!)
        }
      },
      onError: (error) => {
        console.log('Error parsing files:', error)
        openDialog({
          type: 'alert',
          payload: {
            content: `${error}. Please check the file format and try again.`,
          },
        })
      },
    })

    //setShowFileMenu(false)
  }

  function setClinicalData(clinicalTable: BaseDataFrame) {
    const [clinicalTracks, tracksProps] = makeClinicalTracks(clinicalTable)

    setClinicalTracks(clinicalTracks)

    setDisplayProps(
      produce(displayProps, (draft) => {
        draft.legend.clinical.tracks = tracksProps
        draft.legend.clinical.trackOrder = clinicalTracks.map(
          (track) => track.name
        )
      })
    )

    // show sheet in UI
    addSheets([clinicalTable.setName('Clinical')], { mode: 'append' })
  }

  function parseFiles(message: string, files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const file = files[0]!
    const name = file.name
    const text = file.text

    if (message.includes('clinical')) {
      const lines = textToLines(text)

      const clinicalTable = new DataFrameReader()
        .keepDefaultNA(false)
        .read(lines)

      setClinicalData(clinicalTable)
    } else if (message.includes('locations')) {
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
        [{ name: 'Variants', text, ext: name.split('.').pop() || '' }],
        {
          colNames: 1,
          indexCols: 0,
          delimiter: '\t',
          keepDefaultNA: false,
          skipRows: 0,
        }
      )
    }
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
    setClinicalData,
  }
}
