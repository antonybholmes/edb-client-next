'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import { PlayIcon } from '@/icons/play-icon'
import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import {
  filesToDataFrames,
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { OpenIcon } from '@/icons/open-icon'
import { ToolbarButton } from '@/toolbar/toolbar-button'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
} from '@/consts'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import { UploadIcon } from '@/icons/upload-icon'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'

import { textToLines } from '@/lib/text/lines'
import { truncate } from '@/lib/text/text'
import { Buffer } from 'buffer'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import { useGenomes } from '@/lib/edb/genome'
import { CoreProviders } from '@/providers/core-provider'

import { useStableId } from '@/hooks/stable-id'

import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'

import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { AssemblySelect } from '@/lib/edb/assembly-select'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { makeUuid } from '@/lib/id'
import { capitalizeFirstWord } from '@/lib/text/capital-case'
import { useZoom } from '@/providers/zoom'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import { useToolbarTabs } from '@/components/tabs/tab-store'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { useAnnotations } from './annotate-store'
import { useAnnotateWorker } from './annotate-worker'
import APP_INFO from './manifest.json'

export function AnnotationPage() {
  const _id = useStableId('annotate-page')

  const { goto, openFile, addSheets } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()
  const { setAppInfo } = useAppInfo()
  const { settings, updateSettings } = useAnnotations()
  //const [rightTab, setRightTab] = useState(TEXT_SETTINGS)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { gtf } = useGenomes()

  const { open: openDialog } = useDialogs()

  const { run: runAnnotate } = useAnnotateWorker()

  const { zoom } = useZoom()

  const [indicatorMessage, setIndicatorMessage] = useState<string | null>(null)

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  useEffect(() => {
    setAppInfo(APP_INFO)
    const tabs: ITab[] = [
      {
        //id: nanoid(),
        id: 'Home',
        component: () => (
          <>
            <ToolbarTabGroup title={TEXT_FILE} className="items-start">
              <ToolbarOpenFile
                onClick={() => {
                  openFilesDialog({
                    onFileChange: (message, files) => {
                      onFileChange(message, files)
                    },
                  })
                }}
              />
              <ToolbarCol>
                <ToolbarRow>
                  <ToolbarColSmallButton
                    title="Download table to device"
                    onClick={() =>
                      openDialog({
                        type: 'save',
                        payload: {
                          callback: (data) => {
                            save(data.name, data.format.ext)
                          },
                        },
                      })
                    }
                    icon={<DownloadIcon />}
                  >
                    {TEXT_DOWNLOAD}
                  </ToolbarColSmallButton>
                </ToolbarRow>
                <ToolbarRow>
                  <ToolbarColSmallButton
                    title="Annotate locations"
                    onClick={annotate}
                    icon={<PlayIcon />}
                  >
                    Annotate
                  </ToolbarColSmallButton>
                </ToolbarRow>
              </ToolbarCol>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="TSS" className="gap-x-2">
              <DoubleNumericalInput
                h="sm"
                v1={settings.tss.prom5p}
                v2={settings.tss.prom3p}
                limit={[0, 1000000]}
                dp={0}
                inc={1000}
                onNumChange1={(value) =>
                  updateSettings({
                    ...settings,
                    tss: { ...settings.tss, prom5p: value },
                  })
                }
                onNumChange2={(value) =>
                  updateSettings({
                    ...settings,
                    tss: { ...settings.tss, prom3p: value },
                  })
                }
              />
            </ToolbarTabGroup>

            <ToolbarTabGroup title="Options" className="gap-x-2">
              <ToolbarCol gap="gap-x-2">
                <VCenterRow className="gap-x-1">
                  <span>Closest genes:</span>
                  <NumericalInput
                    h="sm"
                    value={settings.closest}
                    onNumChange={(value) =>
                      updateSettings({ ...settings, closest: value })
                    }
                    limit={[0, 10]}
                    dp={0}
                    step={1}
                  />
                </VCenterRow>
                <ToolbarRow>
                  <Checkbox
                    checked={settings.useOfficialGenes}
                    onCheckedChange={(value) =>
                      updateSettings({ ...settings, useOfficialGenes: value })
                    }
                  >
                    Official genes
                  </Checkbox>
                </ToolbarRow>
              </ToolbarCol>
            </ToolbarTabGroup>
          </>
        ),
      },
    ]

    setToolbarTabs(tabs)
  }, [])

  function onFileChange(_message: string, files: FileList | []) {
    if (files.length === 0) {
      return
    }

    const file: File = files[0]! // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = (e) => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter((line) => line.length > 0)
        //.slice(0, 100)

        //const locs = parseLocations(lines)
        const retMap: { [key: string]: Set<string> } = {}
        const geneSets: string[] = lines[0]!.split('\t')

        for (const gs of lines[0]!.split('\t')) {
          retMap[gs] = new Set<string>()
        }

        for (const line of lines.slice(1)) {
          for (const [genei, gene] of line.split('\t').entries()) {
            if (gene.length > 0 && gene !== '----') {
              retMap[geneSets[genei]!]!.add(gene)
            }
          }
        }

        const table = new DataFrameReader()
          .indexCols(0)
          .ignoreRows(file.name.includes('gmx') ? [1] : [])
          .read(lines)
          .setName(file.name)

        //setDataFile(table)

        openFile(name, {
          sheets: [
            table.setName(
              truncate(name, { length: 16 })
            ) as AnnotationDataFrame,
          ],
        })

        // setTestGeneCollection({
        //   name,
        //   genesets: geneSets.map(geneSetName => ({
        //     name: geneSetName,
        //     genes: retMap[geneSetName],
        //   })),
        // })
      }
    }

    fileReader.readAsText(files[0]!)
  }

  async function annotate() {
    if (!sheet || !gtf) {
      return
    }
    setIndicatorMessage('Running....')

    runAnnotate(
      {
        id: makeUuid(),
        df: (sheet as AnnotationDataFrame).values,
        columns: (sheet as AnnotationDataFrame).columns,
        assembly: gtf.assembly,
        closest: settings.closest,
        tss: settings.tss,
        useOfficialGenes: settings.useOfficialGenes,
      },
      (data) => {
        const { error, table, header } = data

        if (error === null) {
          const df = new AnnotationDataFrame({ data: table, columns: header })

          addSheets([df], { name: `Annotated` })
        } else {
          openDialog({
            type: 'alert',
            payload: {
              content: capitalizeFirstWord(error) + '.',
            },
          })
        }

        setIndicatorMessage(null)
      }
    )

    // const dfa = await createAnnotationTable(
    //   sheet as AnnotationDataFrame,
    //   gtf.assembly,
    //   {
    //     closest: settings.closest,
    //     tss: settings.tss,
    //     useOfficialGenes: settings.useOfficialGenes,
    //   }
    // )

    // if (dfa) {
    //   addSheets([dfa], { name: `Annotated` })
    // }
  }

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(sheet as AnnotationDataFrame, {
      hasHeader: true,
      hasIndex: false,
      file: name,
      sep,
    })

    setShowFileMenu(false)
  }

  async function loadTestData() {
    const res = await httpFetch.getText('/data/test/annotate.txt')

    const lines = textToLines(res)

    const table = new DataFrameReader().indexCols(0).read(lines)

    openFile(`Test locations`, {
      sheets: [table.setName('Test Locations') as AnnotationDataFrame],
    })
  }

  //
  // Load available pathways
  //

  // const { data } = useQuery("pathways", async () => {
  //   const res = await fetch("/data/modules/pathways/genesets.json")

  //   if (!res.ok) {
  //     throw new Error("Network response was not ok")
  //   }

  //   return res.json()
  // })

  // let dimText = "Load a pathway file"

  // switch (activeSideTab) {
  //   case 0:
  //     if (df) {
  //       dimText = `${df.shape[0]} rows x ${df.shape[1]} cols`
  //     }
  //     break
  //   case 1:
  //     if (resultsDF) {
  //       dimText = `${resultsDF.shape[0]} rows x ${resultsDF.shape[1]} cols`
  //     }
  //     break
  //   default:
  //     break
  // }

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Open',
      icon: <OpenIcon variant="colorful" />,
      component: () => (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onFileChange(message, files)
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
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      component: () => (
        <>
          <DropdownMenuItem
            aria-label="Save text file"
            onClick={() => save('genomic-annotation.txt', 'txt')}
          >
            <FileIcon />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            aria-label="Save CSV file"
            onClick={() => save('genomic-annotation.csv', 'csv')}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <>
            <AppHeaderIcon />
            <AppInfoButton />
          </>
          <></>

          <AssemblySelect />
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data."
                >
                  Test data
                </ToolbarButton>
                <HistoryShowButton />
              </>
            }
          />
          <ToolbarPanel />
        </Toolbar>

        <HistoryLayout>
          <TabbedDataFrames
            selectedSheet={sheet?.id ?? ''}
            dataFrames={sheets as AnnotationDataFrame[]}
            onTabChange={(selectedTab) => {
              goto({ file, sheet: selectedTab.tab })
            }}
            className="mx-2"
            zoom={zoom}
            onFileDrop={(files) => {
              if (files.length > 0) {
                onTextFileChange('Open from drag', files, (files) => {
                  filesToDataFrames(files, {
                    parseOpts: { indexCols: 0 },
                    onSuccess: (tables) => {
                      if (tables.length > 0) {
                        openFile(tables[0]!.name, { sheets: tables })
                      }
                    },
                    onError: () => {
                      openDialog({
                        type: 'warning',
                        payload: {
                          content:
                            'Your files could not be opened. Check they are formatted correctly.',
                        },
                      })
                    },
                  })
                })
              }
            }}
          />
        </HistoryLayout>

        <FooterPortal className="justify-end">
          <RunningIndicator message={indicatorMessage}>
            <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
          </RunningIndicator>

          <></>

          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function AnnotationQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <AnnotationPage />
      {/* </HistoryProvider> */}
    </CoreProviders>
  )
}
