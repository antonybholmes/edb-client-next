import { FileTree } from '@/components/file-tree'
import type { ITab } from '@/components/tabs/tab-provider'
import { makeUuid } from '@/lib/id'
import { useMemo } from 'react'
import {
  getApps,
  getFiles,
  getPlots,
  getSheets,
  pathJoin,
  useHistory,
} from './history-store'

export function HistoryTree({
  onTabChange,
}: {
  onTabChange: (tab: ITab) => void
}) {
  const { store, state, hydrated } = useHistory()

  const tree: ITab = useMemo(() => {
    const appsTab: ITab = {
      id: makeUuid(),
      name: 'Apps',
      children: [],
    }

    for (const app of getApps(store, state)) {
      console.log('app', app)
      const appTab: ITab = {
        id: app.id,
        path: pathJoin(app),
        name: app.name,
        children: [],
        type: 'app',
      }

      const filesTab: ITab = {
        id: makeUuid(),
        name: 'Files',
        type: 'folder',
        children: [],
      }

      appTab.children = [filesTab]

      for (const file of getFiles(store, state, { app })) {
        const fileTab: ITab = {
          id: file.id,
          name: file.name,
          path: pathJoin(app, file),
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

        filesTab.children!.push(fileTab)
      }

      appsTab.children!.push(appTab)
    }

    return appsTab
  }, [state])

  if (!hydrated) {
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
