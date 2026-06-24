import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  IParseOptions,
  ITextFileOpen,
} from '@/components/pages/open-files'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'

export function useOpen() {
  const { openFile } = useHistory()

  function openFiles(
    files: ITextFileOpen[],
    parseOpts: IParseOptions = { ...DEFAULT_PARSE_OPTS }
  ) {
    filesToDataFrames(files, {
      ...parseOpts,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
        }
      },
    })

    //setShowFileMenu(false)
  }
  return {
    openFiles,
  }
}
