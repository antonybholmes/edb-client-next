import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

//import { ZoomSlider } from "@toolbar/zoom-slider"
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'

import { useEffect, useState } from 'react'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'

import { TEXT_CANCEL } from '@/consts'
import { useMessages } from '@/providers/message-provider'
import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import type { ITab } from '@components/tabs/tab-provider'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'

import { type IDataPanelProps } from '../matcalc/data/data-panel'
import { HistoryPanel } from '../matcalc/history/history-panel'
import {
  HISTORY_ACTION_GOTO_SHEET,
  useHistory,
} from '../matcalc/history/history-store'

export function DataPanel({ branchId: panelId = 'Data' }: IDataPanelProps) {
  const { branch, sheet, sheets, dispatch } = useHistory()

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Clinical Tracks')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const { messages, removeMessage } = useMessages() //'onco-data-panel')

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
    const hasHeader = !sheet.name.includes('GCT')
    const hasIndex = !sheet.name.includes('GCT')

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader,
      hasIndex,
      file: name,
      sep,
    })

    //setShowFileMenu(false)
  }

  useEffect(() => {
    const filteredMessages = messages.filter(
      (message) => message.target === panelId
    )

    for (const message of filteredMessages) {
      if (message.text.includes('save')) {
        let format = 'txt'

        if (message.text.includes(':')) {
          format = message.text.split(':')[1]!
        }

        setShowSave(format)
      }

      if (message.text.includes('show-sidebar')) {
        setShowSideBar(!showSideBar)
      }

      removeMessage(message.id)
    }
  }, [messages])

  const rightTabs: ITab[] = [
    {
      ////name: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
    },
  ]

  return (
    <>
      {showSave && (
        <SaveTxtDialog
          name="oncoplot"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              save(data!.name as string, (data!.format as ISaveAsFormat).ext)
            }

            setShowSave('')
          }}
        />
      )}

      <TabSlideBar
        id="onco-data-panel"
        side="right"
        tabs={rightTabs}
        onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
        value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          selectedSheet={sheet?.id ?? ''}
          dataFrames={sheets as AnnotationDataFrame[]}
          onTabChange={(selectedTab) => {
            dispatch({
              type: HISTORY_ACTION_GOTO_SHEET,
              addr: selectedTab.tab.id,
            })
          }}
          //className={DATA_PANEL_CLS}
        />
      </TabSlideBar>

      {/* <SideBar
          // we must add a key to multiple instances of objects
          // that use usestate otherwise they end up sharing
          key="right-tabs"
          side="Right"
          tabs={rightTabs}
          value={selectedTab}
          onValueChange={setSelectedTab}
        /> */}

      <ToolbarFooterPortal className="justify-end">
        <span>{getFormattedShape(sheet)}</span>
        <></>
        <>
          {/* <ZoomSlider
              scaleIndex={scaleIndex}
              onZoomChange={index => setScaleIndex(index)}
            /> */}
        </>
      </ToolbarFooterPortal>
    </>
  )
}
