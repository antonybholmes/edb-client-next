'use client'

import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { ToolbarButton } from '@components/toolbar/toolbar-button'

import {
  onTextFileChange,
  OpenFiles,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@components/toolbar/toolbar-tab-group'

import { OpenIcon } from '@icons/open-icon'
import { SaveIcon } from '@icons/save-icon'

import { useContext, useRef, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OK,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@components/icons/upload-icon'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { UndoShortcuts } from '@components/toolbar/undo-shortcuts'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { makeRandId } from '@lib/utils'

import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { DeleteIcon } from '@/components/icons/delete-icon'
import { FileIcon } from '@/components/icons/file-icon'
import { SettingsIcon } from '@/components/icons/settings-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { oneWayFromDataframes } from '@/lib/genomic/overlap/one-way-overlap'
import {
  createOverlapTableFromDataframes,
  type OVERLAP_MODE,
} from '@/lib/genomic/overlap/overlap'
import type { ITab } from '@components/tab-provider'
import { CoreProviders } from '@providers/core-providers'
import { FilesPropsPanel } from './files-props-panel'
import MODULE_INFO from './module.json'
import { OverlapContext, OverlapProvider } from './overlap-provider'

function OverlapPage() {
  const downloadRef = useRef<HTMLAnchorElement>(null)

  const {
    order,
    setOrder,
    dfMap,
    setDfs,
    selected,
    setSelected,
    openOverlapFiles,
  } = useContext(OverlapContext)

  const [rightTab, setRightTab] = useState('Options')
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  function openFiles(files: ITextFileOpen[]) {
    openOverlapFiles(files)

    setShowFileMenu(false)
  }

  function overlapGenomicLocations(mode: OVERLAP_MODE = 'mcr') {
    const dataframes = order.map((id) => dfMap.get(id)!)

    const dfOverlaps = createOverlapTableFromDataframes(dataframes, mode)

    if (dfOverlaps) {
      setDfs([...dataframes, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  function overlapOneWay() {
    const dataframes = order.map((id) => dfMap.get(id)!)

    const dfOverlaps = oneWayFromDataframes(dataframes)

    if (dfOverlaps) {
      setDfs([...dataframes, dfOverlaps])
      setSelected(dfOverlaps.id)
    }
  }

  function save(format: 'txt' | 'csv') {
    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(dfMap.get(selected)!, downloadRef, {
      hasHeader: true,
      hasIndex: false,
      file: `table.${format}`,
      sep,
    })

    setShowFileMenu(false)
  }

  // Load a default sheet
  // useEffect(() => {
  //   loadDefaultSheet(historyDispatch)
  // }, [])

  // async function loadTestData() {
  //   const res = await queryClient.fetchQuery({
  //     queryKey: ['test_data'],
  //     queryFn: () => axios.get('/data/test/geneconv.txt'),
  //   })

  //   try {
  //     const lines = textToLines(res.data)

  //     const table = new DataFrameReader().indexCols(0).read(lines)

  //     // historyDispatch({
  //     //   type: 'open',
  //     //   description: `Load Test`,
  //     //   sheets: [table.setName('Geneconv Test')],
  //     // })
  //   } catch (error) {
  //     // do nothing
  //   }
  // }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup>
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: makeRandId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              arial-label="Save table to local file"
              onClick={() => save('txt')}
              title="Save table"
            >
              <SaveIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              title="Calculate minimum common regions for columns of genomic coordinates"
              onClick={() => overlapGenomicLocations('mcr')}
            >
              MCR
            </ToolbarButton>
            <ToolbarButton
              aria-label="Calculate maximum overlap regions for columns of genomic coordinates"
              onClick={() => overlapGenomicLocations('max')}
            >
              Min/max
            </ToolbarButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup>
            <ToolbarButton
              title="Calculate minimum common regions for columns of genomic coordinates"
              onClick={() => overlapOneWay()}
            >
              One Way
            </ToolbarButton>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    {
      //id: nanoid(),
      icon: <SettingsIcon />,
      id: 'Files',
      content: <FilesPropsPanel />,
    },
    // {
    //   //id: nanoid(),
    //   icon: <ClockRotateLeftIcon />,
    //   id: 'History',
    //   content: <HistoryPanel />,
    // },
  ]

  // const sidebar: ITab[] = [
  //   {
  //     icon: <TableIcon className={TOOLBAR_BUTTON_ICON_CLS} />,
  //     label: "Table View",
  //     content: (
  //       <ResizablePanelGroup direction="horizontal">
  //         <ResizablePanel
  //           id="tables"
  //           defaultSize={75}
  //           minSize={50}
  //           className="flex flex-col"
  //         >
  //           <TabbedDataFrames
  //             selectedSheet={history.step.sheetIndex}
  //             dataFrames={history.step.dataframes}
  //             onTabChange={(tab: number) => {
  //               historyDispatch({ type: "goto-sheet", index: tab })
  //             }}
  //             onSelectionChange={setSelection}
  //           />
  //         </ResizablePanel>
  //         <HResizeHandle />
  //         <ResizablePanel
  //           className="flex flex-col"
  //           id="right-tabs"
  //           defaultSize={25}
  //           minSize={10}
  //           collapsible={true}
  //         >
  //           <SideBar side="Right"
  //             tabs={rightTabs}
  //             activeTabIndex={selectedRightTab}
  //             onTabChange={setSelectedRightTab}
  //           />
  //         </ResizablePanel>
  //       </ResizablePanelGroup>

  //     ),
  //   },
  // ]

  // const fileMenuTabs: ITab[] = [
  //   {
  //     id: nanoid(),
  //     name: "Open",
  //     icon: <OpenIcon fill="" w="w-5" />,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">Open</h1>

  //         <ul className="flex flex-col gap-y-2 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Open file on your computer"
  //               onClick={() =>
  //                 setShowDialog({ name: makeRandId("open"), params: {} })
  //               }
  //             >
  //               <OpenIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Open local file
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Open a local file on your computer.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  //   {
  //     id: nanoid(),
  //     name: TEXT_SAVE_AS,
  //     content: (
  //       <BaseCol className="gap-y-6 p-6">
  //         <h1 className="text-2xl">{TEXT_SAVE_AS}</h1>

  //         <ul className="flex flex-col gap-y-1 text-xs">
  //           <li>
  //             <MenuButton
  //               aria-label="Save text file"
  //               onClick={() => save("txt")}
  //             >
  //               <FileLinesIcon className="w-6" />
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as TXT
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a tab-delimited text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //           <li>
  //             <MenuButton
  //               aria-label="Save CSV file"
  //               onClick={() => save("csv")}
  //             >
  //               <p>
  //                 <span className={FILE_MENU_ITEM_HEADING_CLS}>
  //                   Download as CSV
  //                 </span>
  //                 <br />
  //                 <span className={FILE_MENU_ITEM_DESC_CLS}>
  //                   Save table as a comma separated text file.
  //                 </span>
  //               </p>
  //             </MenuButton>
  //           </li>
  //         </ul>
  //       </BaseCol>
  //     ),
  //   },
  // ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon stroke="" w="w-5" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: makeRandId('open'), params: {} })}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('txt')}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id === 'alert' && (
        <BasicAlertDialog onReponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      {showDialog.id.startsWith('delete-sheet') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              setDfs(
                order
                  .filter((order) => order !== showDialog.params!.id)
                  .map((id) => dfMap.get(id)!)
              )
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to delete this sheet?
        </OKCancelDialog>
      )}

      <ShortcutLayout info={MODULE_INFO} showSignInError={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                show={showSideBar}
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        <TabSlideBar
          side="Right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <>
            {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
            <TabbedDataFrames
              selectedSheet={selected}
              dataFrames={order.map((id) => dfMap.get(id)!)}
              // onTabChange={selectedTab => {
              //   historyDispatch({
              //     type: 'goto-sheet',
              //     sheetId: selectedTab.index,
              //   })
              // }}
              className="mx-2"
              style={{ marginBottom: '-2px' }}
              menuActions={[
                { action: 'Delete', icon: <DeleteIcon stroke="" /> },
              ]}
              menuCallback={(tab: ITab, action: string) => {
                if (action === 'Delete') {
                  setShowDialog({
                    id: makeRandId('delete-sheet'),
                    params: { id: tab.id },
                  })
                }
              }}
              onTabChange={(v) => {
                console.log(v)
                setSelected(v.tab.id)
              }}
              onReorder={setOrder}
              allowReorder={true}
              onFileDrop={(files) => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  //console.log('Dropped file:', files[0])

                  onTextFileChange('Open dropped file', files, openOverlapFiles)
                }
              }}
            />
            {/* </Card> */}
          </>
        </TabSlideBar>

        <ToolbarFooter className="justify-end">
          <></>
          <></>
          <></>
        </ToolbarFooter>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            multiple={true}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => openFiles(files))
            }
          />
        )}

        <a ref={downloadRef} className="hidden" href="#" />
      </ShortcutLayout>
    </>
  )
}

export function OverlapQueryPage() {
  return (
    <CoreProviders>
      <OverlapProvider>
        <OverlapPage />
      </OverlapProvider>
    </CoreProviders>
  )
}
