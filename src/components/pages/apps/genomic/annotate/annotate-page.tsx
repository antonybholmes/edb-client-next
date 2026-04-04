// 'use client'

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

import { ZoomSlider } from '@/toolbar/zoom-slider'

import { DataFrameReader } from '@/lib/dataframe/dataframe-reader'
import {
  downloadDataFrame,
  getFormattedShape,
} from '@/lib/dataframe/dataframe-utils'

import {
  filesToDataFrames,
  onTextFileChange,
  OpenFiles,
} from '@/components/pages/open-files'

import { BasicAlertDialog } from '@/dialog/basic-alert-dialog'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { ClockRotateLeftIcon } from '@/icons/clock-rotate-left-icon'
import { OpenIcon } from '@/icons/open-icon'
import { ToolbarButton } from '@/toolbar/toolbar-button'

import { createAnnotationTable } from '@/lib/genomic/annotate'
import { queryClient } from '@/query'

import { useEffect, useState } from 'react'

import {
  type IDialogParams,
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_FILE,
  TEXT_OPEN_FILE,
  TEXT_SAVE_AS,
  TEXT_SAVE_TABLE,
  TEXT_SETTINGS,
} from '@/consts'

import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { ShortcutLayout } from '@/layouts/shortcut-layout'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import type { ITab } from '@/components/tabs/tab-provider'
import { FileIcon } from '@/icons/file-icon'
import { UploadIcon } from '@/icons/upload-icon'
import type { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { httpFetch } from '@/lib/http/http-fetch'

import { textToLines } from '@/lib/text/lines'
import { truncate } from '@/lib/text/text'
import { useQuery } from '@tanstack/react-query'
import { Buffer } from 'buffer'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { API_GENOME_GTFS_URL, type IGenomeAnnotation } from '@/lib/edb/genome'
import { CoreProviders } from '@/providers/core-providers'

import { useStableId } from '@/hooks/stable-id'
import { SelectItem, SelectList } from '@/themed/v2/select'

import { makeUuid, randId } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import { produce } from 'immer'

import { HistoryPanel } from '../../matcalc/history/history-panel'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { useAnnotations } from './annotate-store'
import MODULE_INFO from './module.json'

export function AnnotationPage() {
  const _id = useStableId('annotate-page')

  const { goto, openApp, openFile, addSheets } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()!

  const [rightTab, setRightTab] = useState(TEXT_SETTINGS)
  const [showSideBar, setShowSideBar] = useState(true)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { add: addToast } = Toast.useToastManager()

  const { settings, updateSettings } = useAnnotations()

  useEffect(() => {
    //dispatch({ type: HISTORY_ACTION_APP, name: MODULE_INFO.name })
    openApp(MODULE_INFO.name)
  }, [])

  function onFileChange(_message: string, files: FileList | null) {
    if (!files) {
      return
    }

    const file: File = files[0]! // OR const file = files.item(i);
    const name = file.name

    const fileReader = new FileReader()

    fileReader.onload = e => {
      const result = e.target?.result

      if (result) {
        const text: string =
          typeof result === 'string' ? result : Buffer.from(result).toString()

        const lines = text.split(/[\r\n]+/g).filter(line => line.length > 0)
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
    if (!sheet) {
      return
    }

    const dfa = await createAnnotationTable(
      queryClient,
      sheet as AnnotationDataFrame,
      settings.genome
    )

    if (dfa) {
      addSheets([dfa], { name: `Annotated` })
    }
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

    //resolve({ ...table, name: file.name })

    openFile(`Test locations`, {
      sheets: [table.setName('Test Locations') as AnnotationDataFrame],
    })
  }

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGenomeAnnotation[] }>(
        API_GENOME_GTFS_URL
      )

      return res.data
    },
  })

  const dbs: IGenomeAnnotation[] = genomesQuery.data ? genomesQuery.data : []

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

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    id: randId('open'),
                  })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_TABLE}
              onClick={() => setShowDialog({ id: randId('save') })}
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
          <ToolbarTabGroup title="Analysis">
            <ToolbarButton arial-label="Annotate locations" onClick={annotate}>
              <PlayIcon />
              <span>Annotate</span>
            </ToolbarButton>
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
    //   id: 'Settings',
    //   content: (
    //     <PropsPanel>
    //       <ScrollAccordion value={['databases']}>
    //         <AccordionItem value="databases">
    //           <AccordionTrigger>Databases</AccordionTrigger>
    //           <AccordionContent variant="sidebar">
    //             {dbs.length > 0 && (
    //               <RadioGroup
    //                 defaultValue={assembly ?? dbs[0]!.genome}
    //                 className="flex flex-col gap-y-1.5"
    //               >
    //                 {dbs.map((db: IGeneDbInfo, dbi: number) => (
    //                   <VCenterRow key={dbi} className="gap-x-1">
    //                     <RadioGroupItem
    //                       value={db.genome}
    //                       onClick={() => setAssembly(db.genome)}
    //                     />
    //                     <Label htmlFor={db.genome}>{db.genome}</Label>
    //                   </VCenterRow>
    //                 ))}
    //               </RadioGroup>
    //             )}
    //           </AccordionContent>
    //         </AccordionItem>
    //       </ScrollAccordion>
    //     </PropsPanel>
    //   ),
    // },
    {
      //id: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel />,
    },
  ]

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
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
      //id: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
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
      {showDialog.id === 'alert' && (
        <BasicAlertDialog onResponse={() => setShowDialog({ ...NO_DIALOG })}>
          {showDialog.params!.message as string}
        </BasicAlertDialog>
      )}

      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="genomic-annotation"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as {
                name: string
                format: ISaveAsFormat
              }
              save(
                d.name as string,
                (d.format as ISaveAsFormat)!.ext! as string
              )
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <></>

          <SelectList
            variant="header"
            className="text-xs"
            w="xs"
            value={settings.genome}
            items={dbs.map(db => ({
              value: db.assembly,
              label: db.assembly,
            }))}
            onValueChange={v => {
              if (v) {
                const newStore = produce(settings, draft => {
                  draft.genome = (v as string) ?? draft.genome
                })

                updateSettings(newStore)
              }
            }}
          >
            {dbs.map(db => (
              <SelectItem key={db.assembly} value={db.assembly}>
                {db.assembly}
              </SelectItem>
            ))}
          </SelectList>
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            rightShortcuts={
              <ToolbarButton
                onClick={() => loadTestData()}
                title="Load test data to use features."
              >
                Test data
              </ToolbarButton>
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

        <TabSlideBar
          id="annotate"
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={selectedTab => setRightTab(selectedTab.tab.id)}
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
            onTabChange={selectedTab => {
              goto({ app, file, sheet: selectedTab.tab })
            }}
            className="mx-2"
            onFileDrop={files => {
              if (files.length > 0) {
                onTextFileChange('Open from drag', files, files => {
                  filesToDataFrames(files, {
                    parseOpts: { indexCols: 0 },
                    onSuccess: tables => {
                      if (tables.length > 0) {
                        openFile(tables[0]!.name, { sheets: tables })
                      }
                    },
                    onFailure: () => {
                      console.log('fail')
                      addToast({
                        id: makeUuid(),
                        title: MODULE_INFO.name,
                        description:
                          'Your files could not be opened. Check they are formatted correctly.',
                        type: 'destructive',
                      })
                    },
                  })
                })
              }
            }}
          />
          {/* </Card> */}
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-end">
          <>
            <span>{getFormattedShape(sheet as AnnotationDataFrame)}</span>
          </>
          <></>
          <>
            <ZoomSlider />
          </>
        </ToolbarFooterPortal>

        {showDialog.id.includes('open') && (
          <OpenFiles
            message={showDialog.id}
            //onOpenChange={() => setShowDialog({...NO_DIALOG})}
            onFileChange={onFileChange}
          />
        )}
      </ShortcutLayout>
    </>
  )
}

export function AnnotationQueryPage() {
  return (
    <CoreProviders>
      <AnnotationPage />
    </CoreProviders>
  )
}
