import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { useIsMounted } from '@/hooks/mounted'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { makeUuid } from '@/lib/id'
import { useMemo } from 'react'
import { pathJoin } from './history-provider/history-actions'
import { useFiles } from './history-provider/history-contexts'
import { getPlots, getSheets } from './history-provider/history-hooks'
import { useHistory } from './history-provider/history-provider'

export function HistoryTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const isMounted = useIsMounted()
  const { present, sheets, plots } = useHistory()
  const { files } = useFiles()
  const { appInfo } = useAppInfo()

  const tree: ITab = useMemo(() => {
    const appTab: ITab = {
      id: makeUuid(),
      name: appInfo?.name ?? 'Default',
      type: 'folder',
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

    appTab.children!.push(filesTab)

    return appTab
  }, [files, sheets, plots, appInfo])

  if (!isMounted) {
    return null
  }

  return (
    <FileTree
      tab={tree}
      onValueChange={(t) => {
        onTabChange(t)
      }}
    />
  )
}
