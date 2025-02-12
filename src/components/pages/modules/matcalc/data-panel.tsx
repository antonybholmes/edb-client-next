import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

//import { ZoomSlider } from "@components/toolbar/zoom-slider"

import { ClockRotateLeftIcon } from '@components/icons/clock-rotate-left-icon'
import { FilterIcon } from '@components/icons/filter-icon'
import { LayersIcon } from '@components/icons/layers-icon'

import {
  currentSheet,
  currentSheetId,
  currentSheets,
  HistoryContext,
} from '@providers/history-provider'
import { useContext, useEffect, useRef, useState } from 'react'

import { GroupPropsPanel } from './group-props-panel'

import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { DeleteIcon } from '@/components/icons/delete-icon'
import {
  MessageContext,
  messageTextFileFormat,
} from '@/components/pages/message-provider'
import { FilterPropsPanel } from '@/components/pages/modules/matcalc/filter-props-panel'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { NO_DIALOG, TEXT_DELETE, TEXT_OK, type IDialogParams } from '@/consts'
import { useToast } from '@/hooks/use-toast'
import { DEFAULT_SHEET_NAME } from '@/lib/dataframe/base-dataframe'
import { INF_DATAFRAME } from '@/lib/dataframe/inf-dataframe'
import { makeRandId } from '@/lib/utils'
import { HistoryPanel } from '@components/pages/history-panel'
import {
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { type ISelectedTab, type ITab } from '@components/tab-provider'
import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { GenesetPropsPanel } from './geneset-props-panel'
import { MatcalcSettingsContext } from './matcalc-settings-provider'
import MODULE_INFO from './module.json'
import { OpenDialog } from './open-dialog'

export const DEFAULT_PANEL_ID = 'Table 1'

export const SHEET_PANEL_CLS = 'overflow-hidden relative' //cn(DATA_PANEL_CLS, 'px-3 pt-3')

export interface IDataPanelProps {
  panelId?: string
  //setSlidebarSide: (c: ReactElement | undefined) => void
}

export function DataPanel({ panelId = DEFAULT_PANEL_ID }: IDataPanelProps) {
  const queryClient = useQueryClient()

  const { history, historyDispatch } = useContext(HistoryContext)

  const downloadRef = useRef<HTMLAnchorElement>(null)

  const { toast } = useToast()
  //const [filesToOpen, setFilesToOpen] = useState<ITextFileOpen[]>([])
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Groups')

  const { messageState, messageDispatch } = useContext(MessageContext)

  const { settings: matcalcSettings, updateSettings: updateMatcalcSettings } =
    useContext(MatcalcSettingsContext)

  const [showSave, setShowSave] = useState('')

  //const [showSideBar, setShowSideBar] = useState(true)

  //setFooterLeft(<span>{getFormattedShape(currentSheet(history)[0]!)}</span>)

  function save(format: string) {
    const df = currentSheet(history)[0]!

    if (!df) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'
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
    const messages = messageState.queue.filter((m) => m.target === panelId)

    for (const message of messages) {
      if (message.text.includes('save:')) {
        save(messageTextFileFormat(message))
      } else if (message.text === 'save') {
        setShowSave(messageTextFileFormat(message))
      } else {
        // do nothing
      }
    }

    // clearunknown messages so they are not repeatedly reused
    if (messageState.queue.length > 0) {
      messageDispatch({ type: 'clear' })
    }

    //downloadSvgAsPng(svgRef, canvasRef, downloadRef)
  }, [messageState])

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Groups',
      icon: <LayersIcon />,
      content: <GroupPropsPanel downloadRef={downloadRef} />,
      children: [],
    },
    {
      //id: nanoid(),
      id: 'Filter',
      icon: <FilterIcon />,
      //size: 2.2,
      content: <FilterPropsPanel df={currentSheet(history)[0]!} />,
    },
    {
      //id: nanoid(),
      id: 'Gene Sets',
      //size: 2.2,
      content: <GenesetPropsPanel downloadRef={downloadRef} />,
    },
    {
      //id: nanoid(),
      id: 'History',
      icon: <ClockRotateLeftIcon />,
      content: <HistoryPanel />,
    },
  ]

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        // if (tables.length > 0) {
        //   historyDispatch({
        //     type: 'open',
        //     description: `Load ${tables[0]!.name}`,
        //     sheets: tables,
        //   })
        // }

        // console.log(
        //   'cheese',
        //   currentSheet(history),
        //   currentSheet(history)[0]!.name === DEFAULT_SHEET_NAME,
        //   tables
        // )

        if (
          currentSheets(history)[0].length === 1 &&
          currentSheet(history)[0]!.name === DEFAULT_SHEET_NAME
        ) {
          // if the only sheets appears to be the default filler,
          // then replace
          historyDispatch({
            type: 'open',
            description: `Load ${tables[0]!.name}`,
            sheets: tables,
          })
        } else {
          // add files
          historyDispatch({
            type: 'add-sheets',
            sheets: tables,
          })
        }
      },
      onFailure: () => {
        console.log('fail')
        toast({
          title: MODULE_INFO.name,
          description:
            'Your files could not be opened. Check they are formatted correctly.',
          variant: 'destructive',
        })
      },
    })

    // remove existing plots
    // plotsDispatch({ type: 'clear' })

    // setShowFileMenu(false)

    //setFilesToOpen([])

    setShowDialog({ ...NO_DIALOG })
  }

  const sheets = currentSheets(history)[0]

  return (
    <>
      {showSave && (
        <SaveTxtDialog
          onSave={(format) => {
            save(format.ext)
            setShowSave('')
          }}
          onCancel={() => setShowSave('')}
        />
      )}

      {showDialog.id.startsWith('open-files') && (
        <OpenDialog
          files={showDialog.params!.files as ITextFileOpen[]}
          openFiles={openFiles}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      {showDialog.id.startsWith('delete-sheet') && (
        <OKCancelDialog
          title={MODULE_INFO.name}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              if (sheets.length > 1) {
                historyDispatch({
                  type: 'remove-sheet',
                  sheetId: showDialog.params!.sheetId as string,
                })
              } else {
                // if user is removing the only remaining sheet, load an empty
                // sheet into the UI
                historyDispatch({
                  type: 'add-sheets',
                  mode: 'reset',
                  sheets: INF_DATAFRAME,
                })
              }
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete this sheet?
        </OKCancelDialog>
      )}

      <TabSlideBar
        value={selectedTab}
        tabs={rightTabs}
        side="Right"
        limits={[50, 85]}
        onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
        open={matcalcSettings.data.sidebar.show}
        onOpenChange={(v) => {
          const newSettings = produce(matcalcSettings, (draft) => {
            draft.data.sidebar.show = v
          })

          updateMatcalcSettings(newSettings)
        }}
      >
        {/* <Card className="pb-0" variant="content"> */}
        <TabbedDataFrames
          selectedSheet={currentSheetId(history)[0]!}
          dataFrames={sheets}
          onTabChange={(selectedTab: ISelectedTab) => {
            historyDispatch({
              type: 'goto-sheet',
              sheetId: selectedTab.tab.id,
            })
          }}
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open from drag', files, (files) => {
                setShowDialog({
                  id: makeRandId('open-files'),
                  params: { files },
                })
              })
            }
          }}
          className="relative"
          style={{ marginBottom: '-2px' }}
          onReorder={(order) => {
            historyDispatch({
              type: 'sheet-order',
              sheetIds: order,
            })
          }}
          allowReorder={true}
          menuActions={[
            { action: TEXT_DELETE, icon: <DeleteIcon stroke="" /> },
          ]}
          menuCallback={(tab, action) => {
            if (action === TEXT_DELETE) {
              setShowDialog({
                id: makeRandId('delete-sheet'),
                params: { sheetId: tab.id },
              })
            }
          }}
        />
        {/* </Card> */}
      </TabSlideBar>

      <ToolbarFooter>
        <span>{getFormattedShape(currentSheet(history)[0]!)}</span>
      </ToolbarFooter>

      <a ref={downloadRef} className="hidden" href="#" />
    </>
  )
}
