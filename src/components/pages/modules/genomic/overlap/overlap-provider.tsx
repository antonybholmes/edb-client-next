import { type IChildrenProps } from '@interfaces/children-props'

import type { ITextFileOpen } from '@/components/pages/open-files'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { INF_DATAFRAME } from '@/lib/dataframe/inf-dataframe'
import { range } from '@/lib/math/range'
import { textToLines } from '@/lib/text/lines'
import { createContext, useState } from 'react'

export const OverlapContext = createContext<{
  order: string[]
  setOrder: (order: string[]) => void
  dfMap: Map<string, BaseDataFrame>
  setDfs: (dfs: BaseDataFrame[]) => void
  selected: string
  setSelected: (selected: string) => void
  openOverlapFiles: (files: ITextFileOpen[]) => void
}>({
  order: [],
  setOrder: () => {},
  dfMap: new Map<string, BaseDataFrame>(),
  setDfs: () => {},
  selected: '',
  setSelected: () => {},
  openOverlapFiles: () => {},
})

export function OverlapProvider({ children }: IChildrenProps) {
  const [dfMap, setDataFrames] = useState<Map<string, BaseDataFrame>>(
    new Map<string, BaseDataFrame>([[INF_DATAFRAME.id, INF_DATAFRAME]])
  )
  const [order, setOrder] = useState<string[]>([INF_DATAFRAME.id])
  const [selected, setSelected] = useState<string>(INF_DATAFRAME.id)
  const [isDefaultState, setIsDefaultState] = useState(true)

  function _setDfs(dfs: BaseDataFrame[]) {
    if (dfs.length === 0) {
      // reset to default
      dfs = [INF_DATAFRAME]
      setIsDefaultState(true)
      setSelected(INF_DATAFRAME.id)
    }

    setDataFrames(new Map<string, BaseDataFrame>(dfs.map(df => [df.id, df])))
    setOrder(dfs.map(df => df.id))
  }

  // const handleReorder = useCallback(
  //   (newOrder: string[]) => {
  //     // Check if the new list is different from the current one

  //     if (JSON.stringify(newOrder) !== JSON.stringify(order)) {
  //       setOrder(newOrder)
  //     }
  //   },
  //   [order]
  // )

  function openOverlapFiles(files: ITextFileOpen[]) {
    if (files.length === 0) {
      return
    }

    const tables: BaseDataFrame[] = []

    try {
      for (const file of files) {
        const name = file.name
        let table: BaseDataFrame | null = null

        // regular text so we can do that in browser

        const lines = textToLines(file.text)

        const sep = name.endsWith('csv') ? ',' : '\t'

        const isBed = name.endsWith('bed')

        table = new DataFrameReader()
          .delimiter(sep)
          .keepDefaultNA(false)
          .colNames(isBed ? 0 : 1)
          .indexCols(isBed ? 0 : 1)
          .read(lines)
          .setName(name)

        if (isBed) {
          table = table.setColNames([
            ...['chr', 'start', 'end'],
            ...range(table.shape[1] - 3).map(i => `data ${i + 1}`),
          ])
        }

        tables.push(table)
      }

      if (isDefaultState) {
        _setDfs(tables)
        setIsDefaultState(false)
      } else {
        _setDfs([...order.map(id => dfMap.get(id)!), ...tables])
      }
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <OverlapContext.Provider
      value={{
        order,
        setOrder,
        dfMap,
        setDfs: _setDfs,
        selected,
        setSelected,
        openOverlapFiles,
      }}
    >
      {children}
    </OverlapContext.Provider>
  )
}
