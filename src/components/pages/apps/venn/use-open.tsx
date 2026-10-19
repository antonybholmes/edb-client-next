import { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { rangeMap } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import { ITextFileOpen } from '../../open-files'
import { makeVennList, useVenn } from './venn-store'

export function useOpen() {
  const { setVennLists } = useVenn()

  function openFiles(files: ITextFileOpen[]) {
    const file = files[0]!
    const name = file.name

    console.log('name', name)

    const lines = textToLines(file.text)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .delimiter(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines).t

    const lists = rangeMap((ri) => {
      const id = (ri + 1).toString()

      return makeVennList(
        id,
        table.index.str(ri),
        table.row(ri).strs.filter((s) => s !== '')
      )
    }, table.shape[0])

    setVennLists(lists)
  }

  function openDataframe(df: BaseDataFrame) {
    console.log('df', df)
    setVennLists(
      rangeMap((ri) => {
        const id = (ri + 1).toString()

        return makeVennList(id, df.index.str(ri), df.row(ri).strs)
      }, df.shape[0])
    )
  }

  return {
    openFiles,
    openDataframe,
  }
}
