'use client'

import { useEffect, useMemo, useState } from 'react'

import { CollapseTree, ROOT_NODE } from '@/components/collapse-tree'

import { BaseCol } from '@/layout/base-col'

import { type ITab } from '@/components/tabs/tab-provider'
import { VScrollPanel } from '@/components/v-scroll-panel'

import { FileChartColumnIncreasing, FileSpreadsheet } from 'lucide-react'

import {
  useCurrentSelections,
  useFiles,
} from './history/history-provider/history-contexts'
import { getPlots, getSheets } from './history/history-provider/history-hooks'
import { useHistory } from './history/history-provider/history-provider'
import { HistoryPlot } from './history/history-provider/history-types'

export const TAB_DATA_TABLES = 'Data Tables'

const DATA_TABLES_TAB: ITab = Object.freeze({
  id: '019f1f1d-c97a-7e70-9b9e-de3b247ee64c',
  name: TAB_DATA_TABLES,
  type: 'folder',
  children: [],
})

const PLOTS_TAB: ITab = Object.freeze({
  id: '019f1f1d-e590-78ec-bf6a-c8135b33f128',
  name: 'Plots',
  type: 'folder',
  children: [],
})

export function MatcalcFileTree() {
  const { present, sheets, plots, goto, remove, removeFiles } = useHistory()
  //const [treeRootTab, setTreeRootTab] = useState<ITab>(TREE_ROOT_TAB)
  const [selectedPanelTab, setSelectedPanelTab] = useState<string>('')

  const { selection: currentSelection } = useCurrentSelections()

  const { files } = useFiles()

  const treeRootTab = useMemo(() => {
    //const lastHistoryAction = historyActions[historyActions.length - 1]!

    const tableChildrenTabs: ITab[] = []
    const plotChildrenTabs: ITab[] = []

    const allPlots: HistoryPlot[] = []

    for (const [fi, file] of files.entries()) {
      const s = getSheets(present, sheets, { file })

      // a file must have at least one sheet
      const sheet = s.length > 1 ? s[1]! : s[0]! // history.sheetMap[step.sheets[0]!]!

      const fileNode: ITab = {
        id: sheet.id,
        name: sheet?.name ?? `File ${fi + 1}`, //'Sheet', //sheet?.name ?? `File ${fi + 1}`,
        icon: <FileSpreadsheet strokeWidth={1.5} size={18} />,
        children: [],
        onClick: () => {
          setSelectedPanelTab(sheet.id)

          goto({ file, sheet })
        },

        onDelete: () => {
          removeFiles([{ file }]) //file.id], 'file')
        },
        type: 'file',
      }

      const p = getPlots(present, plots, { file })
      const plotNodes: ITab[] = []

      for (const [pi, plot] of p.entries()) {
        const plotNode: ITab = {
          id: plot.id, //file.id,
          name: `${plot?.name ?? 'Plot'} ${pi + 1}`,
          type: 'plot',
          icon: <FileChartColumnIncreasing strokeWidth={1.5} size={18} />,

          onClick: () => {
            setSelectedPanelTab(plot.id)

            goto({ file, sheet, plot })
          },
          onDelete: () => {
            remove([{ file, plot }])
          },
        }

        plotNodes.push(plotNode)
        plotChildrenTabs.push(plotNode)
      }

      // if (plotNodes.length > 0) {
      //   const plotFolderNode: ITab = {
      //     id: sheet.id + '-plot-folder',
      //     name: 'Plots',
      //     type: 'folder',

      //     children: plotNodes,
      //   }

      //   fileNode.children = [plotFolderNode]
      // }

      // const fileFolderNode: ITab = {
      //   id: sheet.id + '-file-folder',
      //   name: sheet?.name ?? `File ${fi + 1}`,
      //   type: 'folder',
      //   //icon: <FileSpreadsheet strokeWidth={1.5} size={20} />,
      //   children: [fileNode],
      // }

      tableChildrenTabs.push(fileNode)

      allPlots.push(...getPlots(present, plots, { file }))
    }

    return {
      ...ROOT_NODE,
      children: [
        { ...DATA_TABLES_TAB, children: tableChildrenTabs },
        { ...PLOTS_TAB, children: plotChildrenTabs },
      ],
    }
  }, [files, plots])

  // decide what to highlight in tree
  useEffect(() => {
    if (
      currentSelection &&
      (currentSelection.type === 'sheet' || currentSelection.type === 'plot')
    ) {
      setSelectedPanelTab(currentSelection.id)
    }
  }, [currentSelection])

  return (
    <BaseCol className="pl-1 grow">
      <VScrollPanel className="grow">
        <CollapseTree
          tab={treeRootTab}
          value={selectedPanelTab}
          showRoot={false}

          ///asChild={false}
        />
      </VScrollPanel>
    </BaseCol>
  )
}
