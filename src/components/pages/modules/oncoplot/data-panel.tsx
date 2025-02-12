import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

//import { ZoomSlider } from "@components/toolbar/zoom-slider"
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import { ClockRotateLeftIcon } from '@components/icons/clock-rotate-left-icon'

import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'
import { useContext, useEffect, useRef, useState } from 'react'

import { MessageContext } from '@/components/pages/message-provider'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'

import { HistoryPanel } from '@components/pages/history-panel'
import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import type { ITab } from '@components/tab-provider'
import { type IDataPanelProps } from '../matcalc/data-panel'

export function DataPanel({ panelId = 'Data' }: IDataPanelProps) {
  const { history, historyDispatch } = useContext(HistoryContext)

  const downloadRef = useRef<HTMLAnchorElement>(null)

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Clinical Tracks')

  //const [scaleIndex, setScaleIndex] = useState(3)

  const { messageState, messageDispatch } = useContext(MessageContext)

  const [showSave, setShowSave] = useState('')

  const [showSideBar, setShowSideBar] = useState(true)

  function save(format: ISaveAsFormat) {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    const sep = format.ext === 'csv' ? ',' : '\t'
    const hasHeader = !df.name.includes('GCT')
    const hasIndex = !df.name.includes('GCT')

    downloadDataFrame(df, downloadRef, {
      hasHeader,
      hasIndex,
      file: `table.${format}`,
      sep,
    })

    //setShowFileMenu(false)
  }

  useEffect(() => {
    const messages = messageState.queue.filter(
      (message) => message.target === panelId
    )

    console.log(messageState.queue, panelId)

    messages.forEach((message) => {
      console.log(message)

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
    })

    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }
    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  const rightTabs: ITab[] = [
    {
      ////name: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  return (
    <>
      <SaveTxtDialog
        open={showSave}
        onSave={(format) => {
          save(format)
          setShowSave('')
        }}
        onCancel={() => setShowSave('')}
      />

      {/* <ResizablePanelGroup
        direction="horizontal"
        id="heatmap-resizable-panels"

        //autoSaveId="heatmap-resizable-panels"
      >
        <ResizablePanel
          defaultSize={75}
          minSize={50}
          className="pl-2 pt-2 flex min-h-0 flex-col"
          id="data-frames"
          order={1}
        >
          <TabbedDataFrames
            selectedSheet={currentStep(history)[0]!.sheetIndex}
            dataFrames={currentSheets(history)[0]!}
            onTabChange={(tab: number) => {
              historyDispatch({ type: "goto-sheet", sheetId: tab })
            }}
          />
        </ResizablePanel>
        <ThinHResizeHandle />
        <ResizablePanel
          id="data-frames-right"
          className="flex min-h-0 flex-col overflow-hidden"
          defaultSize={25}
          minSize={15}
          collapsible={true}
          order={2}
        >
          <SideBarTextTabs
            // we must add a key to multiple instances of objects
            // that use usestate otherwise they end up sharing
            key="right-tabs"
            tabs={rightTabs}
            value={selectedTab}
            onValueChange={setSelectedTab}
          />
        </ResizablePanel>
      </ResizablePanelGroup> */}

      <TabSlideBar
        side="Right"
        tabs={rightTabs}
        onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
        value={selectedTab}
        open={showSideBar}
        onOpenChange={setShowSideBar}
      >
        <TabbedDataFrames
          selectedSheet={currentSheetId(history)[0]!}
          dataFrames={currentSheets(history)[0]!}
          onTabChange={(selectedTab) => {
            historyDispatch({
              type: 'goto-sheet',
              sheetId: selectedTab.index,
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

      <ToolbarFooter className="justify-end">
        <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
        <></>
        <>
          {/* <ZoomSlider
              scaleIndex={scaleIndex}
              onZoomChange={index => setScaleIndex(index)}
            /> */}
        </>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />
    </>
  )
}
