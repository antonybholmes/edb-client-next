import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { makeUuid } from '@/lib/id'
import { useMemo } from 'react'
import { pathJoin } from './history-provider/history-actions'
import { useFiles } from './history-provider/history-contexts'
import { getPlots, getSheets } from './history-provider/history-hooks'
import { useHistory } from './history-provider/history-provider'

export function HistoryAppTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const { present, sheets, plots } = useHistory()
  const { files } = useFiles()

  const tree: ITab = useMemo(() => {
    const filesTab: ITab = {
      id: makeUuid(),
      name: 'Files',
      type: 'folder',
      children: [],
    }

    for (const file of files) {
      const fileTab: ITab = {
        id: file.id,
        name: file.name,
        path: pathJoin(file),
        children: [],
        type: 'file',
      }

      const sheetsTab: ITab = {
        id: `sheets-folder:${file.id}`,

        name: 'Sheets',
        type: 'folder',
        children: [],
      }

      const plotsTab: ITab = {
        id: `plots-folder:${file.id}`,

        name: 'Plots',
        type: 'folder',
        children: [],
      }

      for (const sheet of getSheets(present, sheets, { file })) {
        const sheetTab: ITab = {
          id: sheet.id,

          name: sheet.name,
          path: pathJoin(file, sheet),
          data: sheet,
          //createdAt: sheet.createdAt,
          type: 'sheet',
        }

        sheetsTab.children!.push(sheetTab)
      }

      for (const plot of getPlots(present, plots, { file })) {
        const plotTab: ITab = {
          id: plot.id,
          path: pathJoin(file, plot),
          name: plot.name,
          data: plot,
          createdAt: plot.createdAt,
          type: 'plot',
        }

        plotsTab.children!.push(plotTab)
      }

      fileTab.children = [sheetsTab, plotsTab]
      filesTab.children!.push(fileTab)
    }

    return filesTab
  }, [present, files, sheets, plots])

  return (
    <FileTree
      tab={tree}
      onValueChange={(t) => {
        onTabChange(t)
      }}
    />
  )
}
