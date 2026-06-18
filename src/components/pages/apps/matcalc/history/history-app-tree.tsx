import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { useMemo } from 'react'
import {
  getApps,
  getFiles,
  getPlots,
  getSheets,
  pathJoin,
  useHistory,
} from './history-store'

export function HistoryAppTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const { store, state } = useHistory()

  const tree: ITab = useMemo(() => {
    const appsTab: ITab = {
      id: 'apps',
      name: 'Apps',
      children: [],
    }

    for (const app of getApps(store, state)) {
      const appTab: ITab = {
        id: app.id,
        name: app.name,
        path: pathJoin(app),
        children: [],
        type: 'app',
      }

      for (const file of getFiles(store, state, { app })) {
        const fileTab: ITab = {
          id: file.id,
          name: file.name,
          path: pathJoin(app, file),
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

        for (const sheet of getSheets(store, state, { file })) {
          const sheetTab: ITab = {
            id: sheet.id,

            name: sheet.name,
            path: pathJoin(app, file, sheet),
            data: sheet,
            //createdAt: sheet.createdAt,
            type: 'sheet',
          }

          sheetsTab.children!.push(sheetTab)
        }

        for (const plot of getPlots(store, state, { file })) {
          const plotTab: ITab = {
            id: plot.id,
            path: pathJoin(app, file, plot),
            name: plot.name,
            data: plot,
            createdAt: plot.createdAt,
            type: 'plot',
          }

          plotsTab.children!.push(plotTab)
        }

        fileTab.children = [sheetsTab, plotsTab]

        appTab.children!.push(fileTab)
      }

      appsTab.children!.push(appTab)
    }

    return appsTab
  }, [state])

  return (
    <FileTree
      tab={tree}
      onValueChange={t => {
        onTabChange(t)
      }}
    />
  )
}
