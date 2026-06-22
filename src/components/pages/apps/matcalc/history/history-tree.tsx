import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { makeUuid } from '@/lib/id'
import { useMemo } from 'react'
import { pathJoin } from './history-provider/history-actions'
import { useFiles } from './history-provider/history-contexts'
import { usePlots, useSheets } from './history-provider/history-hooks'

export function HistoryTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const { files } = useFiles()

  const tree: ITab = useMemo(() => {
    const appsTab: ITab = {
      id: makeUuid(),
      name: 'Apps',
      children: [],
    }

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
        id: makeUuid(),

        name: 'Sheets',
        type: 'folder',
        children: [],
      }

      const plotsTab: ITab = {
        id: makeUuid(),

        name: 'Plots',
        type: 'folder',
        children: [],
      }

      for (const sheet of useSheets({ file })) {
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

      for (const plot of usePlots({ file })) {
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
  }, [files])

  return (
    <FileTree
      tab={tree}
      onValueChange={(t) => {
        onTabChange(t)
      }}
    />
  )
}
