'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import {
  DEFAULT_PARSE_OPTS,
  filesToDataFrames,
  onTextFileChange,
  type IParseOptions,
  type ITextFileOpen,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { OpenIcon } from '@/icons/open-icon'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
} from '@/consts'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'
import { createGeneConvTable, type Species } from '@/lib/gene/geneconv'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderSlotPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import { useStableId } from '@/hooks/stable-id'
import { HeaderButton } from '@/layouts/header-button'
import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'

import { useAppInfo } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { textToLines } from '@/lib/text/lines'
import { CoreProviders } from '@/providers/core-providers'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import APP_INFO from './manifest.json'

export function GeneConvPage() {
  const _id = useStableId('gene-convert-page')

  const { openFile, goto, addSheets } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()

  const { setAppInfo } = useAppInfo()

  const [fromSpecies, setFromSpecies] = useState<Species>('human')
  const [toSpecies, setToSpecies] = useState<Species>('mouse')
  const [exact] = useState(true)

  const { open: openDialog } = useDialogs()
  const [showSideBar, setShowSideBar] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const speciesTabs = [
    { id: 'human', name: 'Human' },
    { id: 'mouse', name: 'Mouse' },
  ]

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

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

    const dfa = await createGeneConvTable(sheet as AnnotationDataFrame, {
      fromSpecies,
      toSpecies,
      exact,
    })

    if (dfa) {
      addSheets([dfa], { name: `Gene Conversion` })
    }
  }

  function save(format: string) {
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
      component: () => (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarOpenFile
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    callback: (message, files) => {
                      onTextFileChange(message, files, (files) =>
                        openFiles(files)
                      )
                    },
                  },
                })
              }}
              multiple={true}
            />

            <ToolbarIconButton
              onClick={() => {
                openDialog({
                  type: 'save',
                  payload: {
                    callback: (data) => {
                      save(data.format.ext)
                    },
                  },
                })
              }}
              title={TEXT_SAVE_TABLE}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Convert">
            <ToolbarIconButton
              aria-label="Convert"
              onClick={convertGenes}
              title="Convert"
            >
              <PlayIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarTabGroup className="gap-x-2 mr-1" title="From">
            <ToggleGroup
              //variant="outline"

              value={[fromSpecies]}
              onValueChange={(v) => {
                setFromSpecies(v[0]! as Species)
              }}
              size="toolbar"
              direction="toolbar"
            >
              {speciesTabs.map((tab) => (
                <GroupToggle key={tab.id} value={tab.id}>
                  {tab.name}
                </GroupToggle>
              ))}
            </ToggleGroup>
          </ToolbarTabGroup>

          <ToolbarTabGroup className="gap-x-2 ml-1" title="To">
            <ToggleGroup
              value={[toSpecies]}
              onValueChange={(v) => {
                setToSpecies(v[0]! as Species)
              }}
              size="toolbar"
              direction="toolbar"
            >
              {speciesTabs.map((tab) => (
                <GroupToggle key={tab.id} value={tab.id}>
                  {tab.name}
                </GroupToggle>
              ))}
            </ToggleGroup>
          </ToolbarTabGroup>
        </>
      ),
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openDialog({
              type: 'open',
              payload: {
                callback: (message, files) => {
                  onTextFileChange(message, files, (files) => openFiles(files))
                },
              },
            })
          }}
        >
          <UploadIcon stroke="" />

          <span>{TEXT_OPEN_FILE}</span>
        </DropdownMenuItem>
      ),
    },
    {
      id: TEXT_SAVE_AS,
      component: () => (
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
      <HeaderSlotPortal>
        <AppHeaderIcon />
        <AppInfoButton />
      </HeaderSlotPortal>

      <HeaderSlotPortal slot="header-right">
        <HeaderButton
          className="text-xs"
          onClick={() => loadTestData()}
          title="Load test data."
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
              goto({ file, sheet: selectedTab.tab })
            }}
            className="mx-2"
          />

          {/* </TabSlideBar> */}
        </HistoryLayout>
        <FooterPortal className="justify-end">
          <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>

          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GeneConvQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <GeneConvPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
