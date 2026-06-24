import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { useCurrentSheets } from '../history/history-provider/history-contexts'

export function useSave() {
  const { sheet } = useCurrentSheets()

  function save(format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  return {
    save,
  }
}
