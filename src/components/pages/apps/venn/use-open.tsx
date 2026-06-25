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

    const lines = textToLines(file.text)

    const sep = name.endsWith('csv') ? ',' : '\t'

    const table = new DataFrameReader()
      .delimiter(sep)
      .indexCols(0)
      .colNames(1)
      .read(lines).t

    setVennLists(
      Object.fromEntries(
        rangeMap((ci) => {
          const id = (ci + 1).toString()

          return [
            id,
            makeVennList(
              (ci + 1).toString(),
              table.index.str(ci),
              table.row(ci).strs
            ),
          ]
        }, table.shape[0])
      )
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
  }
}
