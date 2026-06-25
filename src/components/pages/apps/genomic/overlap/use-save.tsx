import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { where } from '@/lib/math/where'
import { useContext } from 'react'
import { OverlapContext } from './overlap-provider'

export function useSave() {
  const { dfs, selected } = useContext(OverlapContext)

  function save(format: 'txt' | 'csv') {
    const sep = format === 'csv' ? ',' : '\t'

    const idx = where(dfs, (df) => df.id === selected)

    if (idx.length > 0) {
      downloadDataFrame(dfs[idx[0]!]! as AnnotationDataFrame, {
        hasHeader: true,
        hasIndex: false,
        file: `table.${format}`,
        sep,
      })
    }

    //setShowFileMenu(false)
  }

  return {
    save,
  }
}
