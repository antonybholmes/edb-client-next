import { useDialogs } from '@/components/dialogs/dialogs'
import {
  filesToDataFrames,
  IParseOptions,
  ITextFileOpen,
} from '@/components/pages/open-files'
import { produce } from 'immer'
import { AppendMode } from '../history/history-provider/history-types'

import { useHistory } from '../history/history-provider/history-provider'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function useOpenFiles(opts: { mode?: AppendMode } = {}) {
  const { mode } = opts

  const { open: openDialog } = useDialogs()

  const { openFile } = useHistory()

  const { settings, updateSettings } = useMatcalcSettings()

  function openDataFrames(files: ITextFileOpen[], options: IParseOptions = {}) {
    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, {
            sheets: tables,
            mode:
              mode ?? (settings.files.open.multiFileView ? 'append' : 'set'),
          })
        }
      },
      onError: () => {
        openDialog({
          type: 'alert',
          payload: {
            type: 'error',
            title: 'File Open Error',
            content:
              'Your files could not be opened. Check they are formatted correctly.',
          },
        })
      },
    })

    updateSettings(
      produce(settings, (draft) => {
        draft.view.menus.file.show = false
      })
    )
  }

  return {
    openDataFrames,
  }
}
