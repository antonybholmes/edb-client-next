import { useDialogs } from '@/components/dialogs/dialogs'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { friendlyFilename } from '@/lib/path'
import { useCurrentSheets } from '../history/history-provider/history-contexts'
import { useMatcalcSettings } from '../settings/matcalc-settings'

/**
 * Hook to save the current sheet as a file with a specified name and format.
 * @returns
 */
export function useSave() {
  const { sheets } = useCurrentSheets()
  const { settings } = useMatcalcSettings()
  const { settings: edbSettings } = useEdbSettings()

  function save(name: string, format: string) {
    name = friendlyFilename(name)

    const sep = format === 'csv' ? ',' : '\t'

    let { hasHeader, hasIndex } = edbSettings.save.table

    if (name.toLowerCase().includes('gct') || format.toLowerCase() === 'gct') {
      hasHeader = false
      hasIndex = false
    }

    downloadDataFrame(sheets[0] as AnnotationDataFrame, {
      hasHeader,
      hasIndex,
      file: name,
      sep,
      dp: settings.view.dp,
      commas: settings.view.commas,
    })
  }

  return {
    save,
  }
}

export function useSaveAs() {
  const { save } = useSave()
  const { open: openDialog } = useDialogs()

  openDialog({
    type: 'save',
    payload: {
      callback: (data) => {
        save(data.name, data.format.ext)
      },
    },
  })
}

export function useBasicSaveAs() {
  const { sheets } = useCurrentSheets()
  const { open: openDialog } = useDialogs()

  function save(name: string, format: string) {
    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheets[0] as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: name,
      sep,
    })

    //setShowFileMenu(false)
  }

  function saveAs(name: string = 'table') {
    openDialog({
      type: 'save',
      payload: {
        name,
        callback: (data) => {
          save(data.name, data.format.ext)
        },
      },
    })
  }

  return {
    save,
    saveAs,
  }
}
