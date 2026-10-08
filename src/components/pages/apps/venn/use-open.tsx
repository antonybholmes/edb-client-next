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

    //console.log('sep', sep, lines)

    const table = new DataFrameReader()
      .delimiter(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines).t

    console.log('t', table.shape)

    const lists = rangeMap((ri) => {
      const id = (ri + 1).toString()

      return makeVennList(
        id,
        table.index.str(ri),
        table.row(ri).strs.filter((s) => s !== '')
      )
    }, table.shape[0])

    console.log('lists', lists)

    setVennLists(lists)

    // setListTextMap(
    //   new Map(
    //     table.values.map((r, ri) => [ri, r.map((c) => c.toString()).join('\n')])
    //   )
    // )

    //resolve({ ...table, name: file.name })

    // historyDispatch({
    //   type: "reset",
    //   title: `Load ${name}`,
    //   df: table.setName(truncate(name, { length: 16 })),
    // })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    // setShowFileMenu(false)
  }

  function openDataframe(df: BaseDataFrame) {
    console.log('df', df)
    setVennLists(
      rangeMap((ri) => {
        const id = (ri + 1).toString()

        return makeVennList(id, df.index.str(ri), df.row(ri).strs)
      }, df.shape[0])
    )

    // setListTextMap(
    //   new Map(
    //     table.values.map((r, ri) => [ri, r.map((c) => c.toString()).join('\n')])
    //   )
    // )

    //resolve({ ...table, name: file.name })

    // historyDispatch({
    //   type: "reset",
    //   title: `Load ${name}`,
    //   df: table.setName(truncate(name, { length: 16 })),
    // })

    // historyState.current = {
    //   step: 0,
    //   history: [{ title: `Load ${name}`, df: [table.setName(name)] }],
    // }

    //setShowLoadingDialog(false)

    // setShowFileMenu(false)
  }

  return {
    openFiles,
    openDataframe,
  }
}
