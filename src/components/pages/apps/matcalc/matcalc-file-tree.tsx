'use client'

import { useEffect, useMemo, useState } from 'react'

import { CollapseTree, ROOT_NODE } from '@/components/collapse-tree'

import { BaseCol } from '@/layout/base-col'

import { type ITab } from '@/components/tabs/tab-provider'
import { VScrollPanel } from '@/components/v-scroll-panel'

import { FileChartColumnIncreasing, FileSpreadsheet } from 'lucide-react'

import { makeUuid } from '@/lib/id'
import {
  useCurrentSelections,
  useFiles,
} from './history/history-provider/history-contexts'
import { usePlots, useSheets } from './history/history-provider/history-hooks'
import { useHistory } from './history/history-provider/history-provider'
import { HistoryPlot } from './history/history-provider/history-types'

export const TAB_DATA_TABLES = 'Data Tables'

const DATA_TABLES_TAB: ITab = Object.freeze({
  id: makeUuid(),
  name: TAB_DATA_TABLES,
  type: 'folder',
  children: [],
})

export function MatcalcFileTree() {
  const { goto, remove, removeFiles } = useHistory()
  //const [treeRootTab, setTreeRootTab] = useState<ITab>(TREE_ROOT_TAB)
  const [selectedPanelTab, setSelectedPanelTab] = useState<string>('')

  const { selection: currentSelection } = useCurrentSelections()

  const { files } = useFiles()

  const treeRootTab = useMemo(() => {
    //const lastHistoryAction = historyActions[historyActions.length - 1]!

    const tableChildrenTabs: ITab[] = []

    const allPlots: HistoryPlot[] = []

    for (const [fi, file] of files.entries()) {
      const sheets = useSheets({ file })

      // a file must have at least one sheet
      const sheet = sheets.length > 1 ? sheets[1]! : sheets[0]! // history.sheetMap[step.sheets[0]!]!

      const fileNode: ITab = {
        id: sheet.id,
        name: 'Sheet', //sheet?.name ?? `File ${fi + 1}`, //'Sheet', //sheet?.name ?? `File ${fi + 1}`,
        icon: <FileSpreadsheet strokeWidth={1.5} size={18} />,
        children: [],
        onClick: () => {
          setSelectedPanelTab(sheet.id) //file.id)

          goto({ file, sheet }) //, 'branch')
        },
        onDelete: () => {
          removeFiles([{ file }]) //file.id], 'file')
        },
      }

      const plots = usePlots({ file })
      const plotNodes: ITab[] = []

      for (const [pi, plot] of plots.entries()) {
        const plotNode: ITab = {
          id: plot.id, //file.id,
          name: plot?.name ?? `Plot ${pi + 1}`,
          type: 'plot',
          icon: <FileChartColumnIncreasing strokeWidth={1.5} size={18} />,

          onClick: () => {
            setSelectedPanelTab(plot.id) //file.id)

            goto({ file, sheet, plot }) //, 'branch')
          },
          onDelete: () => {
            remove([{ file, plot }])
          },
        }

        plotNodes.push(plotNode)
      }

      if (plotNodes.length > 0) {
        const plotFolderNode: ITab = {
          id: sheet.id + '-plot-folder',
          name: 'Plots',
          type: 'folder',
          //icon: <FileChartColumnIncreasing strokeWidth={1.5} size={20} />,
          children: plotNodes,
        }

        fileNode.children = [plotFolderNode]
      }

      const fileFolderNode: ITab = {
        id: sheet.id + '-file-folder',
        name: sheet?.name ?? `File ${fi + 1}`,
        type: 'folder',
        //icon: <FileSpreadsheet strokeWidth={1.5} size={20} />,
        children: [fileNode],
      }

      tableChildrenTabs.push(fileFolderNode)

      allPlots.push(...usePlots({ file }))
    }

    return {
      ...ROOT_NODE,
      children: [
        { ...DATA_TABLES_TAB, children: tableChildrenTabs },
        //{ ...PLOTS_TAB, children: plotChildrenTabs },
      ],
    }
  }, [files])

  // decide what to highlight in tree
  useEffect(() => {
    if (
      currentSelection &&
      (currentSelection.type === 'sheet' || currentSelection.type === 'plot')
    ) {
      setSelectedPanelTab(currentSelection.id)
    }
  }, [currentSelection])

  //console.log('Tree root tab', treeRootTab, selectedPanelTab)

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
