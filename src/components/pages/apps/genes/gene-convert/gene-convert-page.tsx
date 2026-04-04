'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@/icons/clock-rotate-left-icon'
import { OpenIcon } from '@/icons/open-icon'

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

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { createGeneConvTable } from '@/lib/gene/geneconv'

import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { randId } from '@/lib/id'

import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'
import { useQueryClient } from '@tanstack/react-query'

import { HeaderSlotPortal } from '@/components/header/header-slot-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { Toggle } from '@/components/shadcn/ui/themed/v2/toggle'
import { useStableId } from '@/hooks/stable-id'
import { HeaderButton } from '@/layouts/header-button'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-providers'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import MODULE_INFO from './module.json'

export function GeneConvPage() {
  const _id = useStableId('gene-convert-page')

  const queryClient = useQueryClient()

  const { openFile, goto, addSheets } = useHistory()

  const app = useApp()!
  const file = useFile()!
  const sheet = useSheet()!
  const sheets = useSheets()

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

    filesToDataFrames(files, {
      parseOpts: options,
      onSuccess: (tables) => {
        if (tables.length > 0) {
          openFile(tables[0]!.name, { sheets: tables })
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
      addSheets([dfa], { name: `Gene Conversion` })
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
    try {
      const res = await httpFetch.getText('/data/test/geneconv.txt')

      const lines = textToLines(res)

      const table = new DataFrameReader().indexCols(0).read(lines)

      openFile(`Test`, {
        sheets: [table.setName('Geneconv Test') as AnnotationDataFrame],
      })
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
            <ToggleGroup
              //variant="outline"

              value={[fromSpecies]}
              onValueChange={(v) => {
                setFromSpecies(v[0]!)
              }}
              size="toolbar"
              className="rounded-theme overflow-hidden gap-x-px"
            >
              {speciesTabs.map((tab) => (
                <GroupToggle
                  key={tab.id}
                  value={tab.id}
                  className="w-14"
                  rounded="none"
                >
                  {tab.id}
                </GroupToggle>
              ))}
            </ToggleGroup>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup className="gap-x-2 ml-1" title="To">
            <ToggleGroup
              value={[toSpecies]}
              onValueChange={(v) => {
                setToSpecies(v[0]!)
              }}
              size="toolbar"
              className="rounded-theme overflow-hidden gap-x-px"
            >
              {speciesTabs.map((tab) => (
                <Toggle
                  key={tab.id}
                  value={tab.id}
                  className="w-14"
                  rounded="none"
                >
                  {tab.id}
                </Toggle>
              ))}
            </ToggleGroup>

            {/* <ToggleButtons
              tabs={speciesTabs}
              value={toSpecies}
              onTabChange={(selectedTab) => {
                setToSpecies(selectedTab.tab.id)
              }}
              className="rounded-theme overflow-hidden"
            >
              <ToggleButtonTriggers defaultWidth={4.5} variant="tab" />
            </ToggleButtons> */}
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
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
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

      <HeaderSlotPortal>
        <ModuleInfoButton info={MODULE_INFO} />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <HeaderButton
          className="text-xs"
          onClick={() => loadTestData()}
          title="Load test data to use features."
        >
          Test data
        </HeaderButton>
      </HeaderSlotPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <HistoryShowButton />
              </>
            }
          />
          <ToolbarPanel
            groupId={_id}
            tabs={tabs}
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

        <HistoryLayout>
          {/* <TabSlideBar
            id="gene-conv"
            side="right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          > */}

          <TabbedDataFrames
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              goto({ app, file, sheet: selectedTab.tab })
            }}
            className="mx-2"
          />

          {/* </TabSlideBar> */}
        </HistoryLayout>
        <ToolbarFooterPortal className="justify-end">
          <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>

          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            message={showDialog.id}
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

export function GeneConvQueryPage() {
  return (
    <CoreProviders>
      <GeneConvPage />
    </CoreProviders>
  )
}
