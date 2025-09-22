'use client'

import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import { PlayIcon } from '@icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { DataFrameReader } from '@lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@components/pages/open-files'

import { BasicAlertDialog } from '@dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { OpenIcon } from '@icons/open-icon'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { useState } from 'react'

import {
  NO_DIALOG,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  type IDialogParams,
} from '@/consts'

import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@icons/upload-icon'
import { createGeneConvTable } from '@lib/gene/geneconv'
import { DropdownMenuItem } from '@themed/dropdown-menu'

import { ShortcutLayout } from '@layouts/shortcut-layout'
import { randId } from '@lib/utils'
import axios from 'axios'

import type { ITab } from '@components/tabs/tab-provider'
import { ToggleButtons, ToggleButtonTriggers } from '@components/toggle-buttons'
import { FileIcon } from '@icons/file-icon'
import type { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { textToLines } from '@lib/text/lines'
import { useQueryClient } from '@tanstack/react-query'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ZoomSlider } from '@toolbar/zoom-slider'

import { DownloadIcon } from '@components/icons/download-icon'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import { useHistory } from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'

export function GeneConvPage() {
  const queryClient = useQueryClient()

  const { branch, sheet, sheets, openBranch, gotoSheet, addStep } = useHistory()

  //const [filesToOpen, setFilesToOpen] = useState<IFileOpen[]>([])

  const [fromSpecies, setFromSpecies] = useState('Human')
  const [toSpecies, setToSpecies] = useState('Mouse')
  const [exact] = useState(true)

  const [rightTab, setRightTab] = useState('Options')
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  const speciesTabs = [{ id: 'Human' }, { id: 'Mouse' }]

  function openFiles(
    files: ITextFileOpen[],
    options: IParseOptions = DEFAULT_PARSE_OPTS
  ) {
    //filesToDataFrames(files, historyDispatch, options)

    filesToDataFrames(queryClient, files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openBranch(`Load ${tables[0]!.name}`, tables)
        }
      },
    })

    setShowFileMenu(false)
  }

  async function convertGenes() {
    if (!sheet) {
      return
    }

    console.log('from', fromSpecies, toSpecies)

    const dfa = await createGeneConvTable(
      queryClient,
      sheet as AnnotationDataFrame,
      fromSpecies,
      toSpecies,
      exact
    )

    if (dfa) {
      addStep(`Gene Conversion`, [dfa])
    }
  }

  function save(format: 'txt' | 'csv') {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
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

  async function loadTestData() {
    const res = await queryClient.fetchQuery({
      queryKey: ['test_data'],
      queryFn: () => axios.get('/data/test/geneconv.txt'),
    })

    try {
      const lines = textToLines(res.data)

      const table = new DataFrameReader().indexCols(0).read(lines)

      openBranch(`Load Test`, [
        table.setName('Geneconv Test') as AnnotationDataFrame,
      ])
    } catch {
      // do nothing
    }
  }

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpenChange={(open) => {
                if (open) {
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              onClick={() => save('txt')}
              title={TEXT_SAVE_TABLE}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Convert">
            <ToolbarIconButton
              aria-label="Convert"
              onClick={convertGenes}
              title="Convert"
            >
              <PlayIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="gap-x-2 mr-1" title="From">
            <ToggleButtons
              tabs={speciesTabs}
              value={fromSpecies}
              onTabChange={(selectedTab) => {
                setFromSpecies(selectedTab.tab.id)
              }}
              className="rounded-theme overflow-hidden"
            >
              <ToggleButtonTriggers defaultWidth={4.5} variant="tab" />
            </ToggleButtons>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="gap-x-2 ml-1" title="To">
            <ToggleButtons
              tabs={speciesTabs}
              value={toSpecies}
              onTabChange={(selectedTab) => {
                setToSpecies(selectedTab.tab.id)
              }}
              className="rounded-theme overflow-hidden"
            >
              <ToggleButtonTriggers defaultWidth={4.5} variant="tab" />
            </ToggleButtons>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    // {
    //   //id: nanoid(),
    //   icon: <SlidersIcon />,
    //   name: "Options",
    //   content: (
    //     <GeneConvertPropsPanel
    //       fromSpecies={fromSpecies}
    //       toSpecies={toSpecies}
    //       exact={exact}
    //       setFromSpecies={setFromSpecies}
    //       setToSpecies={setToSpecies}
    //       setExact={setExact}
    //     />
    //   ),
    // },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
    },
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
      icon: <OpenIcon iconMode="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => setShowDialog({ id: randId('open'), params: {} })}
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
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      <ShortcutLayout signedRequired={false}>
        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarTabButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarTabButton>
            }
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
          id="gene-conv"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          {/* <Card
            variant="content"
            className="mx-2 pb-0"
            style={{ marginBottom: '-2px' }}
          > */}
          <TabbedDataFrames
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              gotoSheet(selectedTab.tab.id)
            }}
            className="mx-2"
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet)}</span>

          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            open={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={(message, files) =>
              onTextFileChange(message, files, (files) => openFiles(files))
            }
          />
        )}
      </ShortcutLayout>
    </>
  )
}
