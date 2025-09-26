import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

//import { ZoomSlider } from "@toolbar/zoom-slider"

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { LayersIcon } from '@icons/layers-icon'

import { useEffect, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DELETE,
  TEXT_OK,
  type IDialogParams,
} from '@/consts'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { DeleteIcon } from '@icons/delete-icon'

import {
  messageTextFileFormat,
  useMessages,
} from '@/providers/message-provider'
import {
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { PropsPanel } from '@components/props-panel'
import { type ISelectedTab, type ITab } from '@components/tabs/tab-provider'
import { FilterIcon } from '@icons/filter-icon'
import {
  AnnotationDataFrame,
  DATAFRAME_100x26,
} from '@lib/dataframe/annotation-dataframe'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'
import { randId } from '@lib/id'
import { friendlyFilename, replaceFileExt } from '@lib/path'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from '@themed/crisp'
import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@toolbar/zoom-slider'
import { produce } from 'immer'
import type { ISaveAsFormat } from '../../../save-as-dialog'
import { HistoryPanel } from '../history/history-panel'
import { useBranch, useHistory } from '../history/history-store'
import MODULE_INFO from '../module.json'
import { OpenDialog } from '../open-dialog'
import { useMatcalcSettings } from '../settings/matcalc-settings'
import { DataPropsPanel } from './data-props-panel'
import { FilterPropsPanel } from './filter-props-panel'

export const DEFAULT_PANEL_ID = 'Table 1'

export const SHEET_PANEL_CLS = 'overflow-hidden relative' //cn(DATA_PANEL_CLS, 'px-3 pt-3')

export interface IDataPanelProps {
  branchId: string
  //setSlidebarSide: (c: ReactElement | undefined) => void
}

export function DataPanel({ branchId }: IDataPanelProps) {
  const queryClient = useQueryClient()

  const { openBranch } = useHistory()

  const {
    branch,
    step,
    sheet,
    sheets,
    addSheets,
    removeSheet,
    gotoSheet,
    reorderSheets,
  } = useBranch(branchId)

  //console.log('data panle2', branchId)
  //const step = useCurrentStep(branchId)
  //const sheet = useCurrentSheet(step?.id ?? '')
  //const sheets = useCurrentSheets(step?.id ?? '')

  //console.log('data panle', branchId, step, sheet)

  //const [filesToOpen, setFilesToOpen] = useState<ITextFileOpen[]>([])
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [working, setWorking] = useState(false)
  //const [tableData, setTableData] = useState<object[]>(DEFAULT_TABLE_ROWS)
  //const [tableH, setTableH] = useState<IReactTableCol[]>(DEFAULT_TABLE_HEADER)
  //const [selectedSheet, setSelectedSheet] = useState(0)

  const [selectedTab, setSelectedTab] = useState('Labels')

  const { messages, removeMessage } = useMessages() //)//'data-panel' + nanoid())

  const { settings: matcalcSettings, updateSettings: updateMatcalcSettings } =
    useMatcalcSettings()

  const [showSave, setShowSave] = useState('')

  // console.log("branbc", branchId, history)
  // const branch = findBranch(branchId, history)[0]
  // const step = getCurrentStepFromBranch(branch)[0]
  // const sheet = getCurrentSheetFromStep(step)[0]

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    name = friendlyFilename(name)

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
    const filteredMessages = messages.filter((m) => m.target === branch?.id)

    for (const message of filteredMessages) {
      //console.log(message)
      if (message.text.includes('save:')) {
        const ext = messageTextFileFormat(message)
        save(
          sheet && sheet.name
            ? replaceFileExt(sheet.name, ext)
            : replaceFileExt('table', ext),
          ext
        )
      } else if (message.text === 'save') {
        setShowSave(messageTextFileFormat(message))
      } else {
        // do nothing
      }

      // clearunknown messages so they are not repeatedly reused
      removeMessage(message.id)
    }
  }, [messages])

  const rightTabs: ITab[] = [
    {
      id: 'Labels',
      icon: <LayersIcon />,
      content: <DataPropsPanel branchId={branchId} />,
    },
    // {
    //   id: 'Groups',
    //   icon: <LayersIcon />,
    //   content: (
    //     <PropsPanel className="gap-y-2">
    //       <GroupPropsPanel branchId={branchId} />
    //     </PropsPanel>
    //   ),
    //   children: [],
    // },
    {
      id: 'Filter',
      icon: <FilterIcon />,
      //size: 2.2,
      content: (
        <PropsPanel className="gap-y-2">
          <FilterPropsPanel branchId={branchId} />
        </PropsPanel>
      ),
    },
    // {
    //   id: 'Gene Sets',
    //   //size: 2.2,
    //   content: (
    //     <PropsPanel className="gap-y-2">
    //       <GenesetPropsPanel branchId={branchId} />
    //     </PropsPanel>
    //   ),
    // },
    {
      id: 'History',
      icon: <ClockRotateLeftIcon />,
      content: <HistoryPanel branchId={branchId} />,
    },
  ]

  function openFiles(files: ITextFileOpen[], options: IParseOptions) {
    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openBranch(`Load ${tables[0]!.name}`, tables)
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

  return (
    <>
      <SaveTxtDialog
        open={showSave !== ''}
        onResponse={(response, data) => {
          if (response !== TEXT_CANCEL) {
            save(
              data!.name as string,
              (data!.format as ISaveAsFormat)!.ext! as string
            )
          }

          setShowSave('')
        }}
      />

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
          contentVariant="glass"
          bodyVariant="card"
          modalType="Warning"
          onResponse={(r) => {
            if (r === TEXT_OK) {
              if (step?.sheets) {
                removeSheet(showDialog.params!.sheetId as string)
              } else {
                // if user is removing the only remaining sheet, load an empty
                // sheet into the UI
                addSheets([DATAFRAME_100x26], 'set')
              }
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete this sheet?
        </OKCancelDialog>
      )}

      <TabSlideBar
        id="matcalc-data-panel"
        value={selectedTab}
        tabs={rightTabs}
        side="right"
        limits={[50, 85]}
        onTabChange={(selectedTab) => setSelectedTab(selectedTab.tab.id)}
        open={matcalcSettings.sidebar.show}
        onOpenChange={(v) => {
          const newSettings = produce(matcalcSettings, (draft) => {
            draft.sidebar.show = v
          })

          updateMatcalcSettings(newSettings)
        }}
      >
        {/* <Card className="pb-0" variant="content"> */}
        <TabbedDataFrames
          selectedSheet={sheet?.id ?? ''}
          dataFrames={sheets as AnnotationDataFrame[]}
          onTabChange={(selectedTab: ISelectedTab) => {
            gotoSheet(selectedTab.tab.id)
          }}
          onFileDrop={(files) => {
            if (files.length > 0) {
              onTextFileChange('Open from drag', files, (files) => {
                setShowDialog({
                  id: randId('open-files'),
                  params: { files },
                })
              })
            }
          }}
          className="relative mx-2"
          style={{ marginBottom: '-2px' }}
          onReorder={(order) => {
            console.log('reorder', order)
            reorderSheets(order)
          }}
          allowReorder={true}
          menuActions={[
            { action: TEXT_DELETE, icon: <DeleteIcon stroke="" /> },
          ]}
          menuCallback={(tab, action) => {
            if (action === TEXT_DELETE) {
              setShowDialog({
                id: randId('delete-sheet'),
                params: { sheetId: tab.id },
              })
            }
          }}
        />
        {/* </Card> */}
      </TabSlideBar>

      <ToolbarFooterPortal>
        <span>{getFormattedShape(sheet)}</span>
        <></>
        <ZoomSlider />
      </ToolbarFooterPortal>
    </>
  )
}

// export function DataPanelQuery({
//   panelId = DEFAULT_PANEL_ID,
// }: IDataPanelProps) {
//   return <DataPanel panelId={panelId} />
// }
