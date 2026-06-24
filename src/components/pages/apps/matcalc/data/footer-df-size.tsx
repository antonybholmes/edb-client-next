import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { getFormattedShape } from '@/lib/dataframe/dataframe-utils'
import { useCurrentSheets } from '../history/history-provider/history-contexts'

/**
 * Simple display of the size (shape) of the current data frame.
 *
 * @returns
 */
export function FooterDFSize() {
  const { sheet } = useCurrentSheets()

  return <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
}
