import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { useCurrentSheets } from '../history/history-provider/history-contexts'

/**
 * Simple display of the size (shape) of the current data frame.
 *
 * @returns
 */
export function FooterDFSize() {
  const { sheets } = useCurrentSheets()

  if (sheets.length === 0) {
    return <span>No table.</span>
  }

  return <span>{getFormattedShape(sheets[0] as AnnotationDataFrame)}</span>
}
