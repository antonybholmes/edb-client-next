// 'use client'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { getDataFrameInfo } from '@/lib/dataframe/dataframe-utils'

import { locStr, parseGenomicLocation } from '@/lib/genomic/genomic'
import { useEffect, useRef, useState } from 'react'

import { formatChr } from '@/lib/genomic/dna'
import { parseGenLoc } from '@/lib/genomic/genomic'

import { PileupPlotPanel } from '@/components/pages/apps/wgs/variants/pileup-plot-panel'
import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { FileImageIcon } from '@/icons/file-image-icon'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/themed/resizable'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { TabbedDataFrames } from '@/components/table/tabbed-dataframes'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { downloadDataFrame } from '@/lib/dataframe/dataframe-utils'
import { makeUuid, randId } from '@/lib/id'
import { downloadSvgAutoFormat } from '@/lib/image-utils'

import { PileupPropsPanel } from './pileup-props-panel'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import { SaveTxtDialog } from '@/components/pages/save-txt-dialog'
import { type ITab } from '@/components/tabs/tab-provider'

import type { ISaveAsFormat } from '@/components/pages/save-as-dialog'
import { FileIcon } from '@/icons/file-icon'
import { Card } from '@/themed/card'
import {
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectList,
} from '@/themed/v2/select'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { ShowSideButton } from '@/components/pages/show-side-button'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { CoreProviders } from '@/providers/core-providers'

import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'
import { produce } from 'immer'
import { LocationAutocomplete } from '../../genomic/seq-browser/location-autocomplete'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'
import {
  useApp,
  useFile,
  useHistory,
  useSheet,
  useSheets,
} from '../../matcalc/history/history-store'
import { DatasetPanel } from './dataset-panel'
import { useDatasets } from './dataset-store'
import { FeaturePropsPanel } from './feature-props-panel'
import { MAFPanel } from './maf-panel'
import MODULE_INFO from './module.json'
import {
  CMAP_NONE,
  useVariantSettings,
  type ICMAP,
  type PredefinedCMAP,
} from './variant-settings-store'
import { useVariants } from './variant-store'

export function VariantsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const _id = 'variants-page'

  const { settings, updateSettings } = useVariantSettings()
  const { datasets, datasetMap, sampleMap } = useDatasets()
  const { variants } = useVariants()

  const [searchLocation, setSearchLocation] = useState(
    locStr(settings.location)
  )
  // Order the display based on the drag list re-ordering

  //const [databases, setDatabases] = useState<IMutationDB[]>([])

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  //const [variants, setVariants] = useState<IVariantResults | null>(null)
  //const [dna, setDna] = useState<IDNA | null>(null)

  const { barProps, setOpen } = useSlideBar('variants-folders')

  //const [addChrPrefix, setAddChrPrefix] = useState(true)

  const [showSideBar, setShowSideBar] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { openApp, openFile, goto } = useHistory()
  const app = useApp()!
  const file = useFile()!
  const sheets = useSheets()
  const sheet = useSheet()

  const df = sheet as AnnotationDataFrame

  useEffect(() => {
    openApp(MODULE_INFO.name)
  }, [])

  useEffect(() => {
    let cmap: ICMAP = { ...CMAP_NONE }

    // see if cmap has existing palette

    switch (settings.variants.colorBy) {
      case 'dataset':
        cmap = {
          id: makeUuid(),
          name: 'Dataset',
          colors: datasets.map((d, di) => ({
            id: makeUuid(),
            name: d.name,
            color: TAB10_PALETTE[di % TAB10_PALETTE.length]!,
          })),
        }

        break
      default:
        // see if we have an existing cmap for the selected color by
        if (settings.variants.colorBy in settings.cmaps) {
          cmap = settings.cmaps[settings.variants.colorBy as PredefinedCMAP]!
        }
        break
    }

    updateSettings(
      produce(settings, draft => {
        draft.variants.cmap = cmap
      })
    )
  }, [datasets, settings.variants.colorBy])

  useEffect(() => {
    setSearchLocation(locStr(settings.location))
  }, [locStr(settings.location)])

  /**
   * Fetch pileup data for a given genomic location.
   *
   * @param search genomic location string e.g. chr1:1000-2000
   * @returns
   */
  // async function getPileup(search: string) {
  //   try {
  //     const location = parseGenLoc(search)

  //     if (!location) {
  //       return
  //     }

  //     let dna: IDNA = { location, seq: '' }

  //     dna = await fetchDNA(queryClient, location, {
  //       format: 'upper',
  //       assembly: 'hg19',
  //     })

  //     setDna(dna)

  //     let variantResults = await searchVariants(
  //       location,
  //       datasets.filter(dataset => datasetUseMap[dataset.id] ?? false)
  //     )

  //     if (!variantResults) {
  //       return
  //     }

  //     setVariants(variantResults)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  useEffect(() => {
    if (!variants) {
      return
    }

    const cooMap = new Map<string, string>(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.id, sample.coo ?? ''] as [string, string]
          )
        )
        .flat()
    )

    const lymphgenMap = new Map<string, string>(
      datasets
        .map(dataset =>
          dataset.samples.map(
            sample => [sample.id, sample.lymphgenClass] as [string, string]
          )
        )
        .flat()
    )

    const loc = parseGenLoc(searchLocation)

    const data = variants
      ? variants.variants.map(variant => {
          let chr = variant.chr.replace('chr', '')

          if (settings.chrPrefix.show) {
            chr = formatChr(chr) // `chr${chr}`
          }

          return [
            sampleMap[variant.sample]!.name,
            chr,
            variant.start,
            variant.end,
            variant.start - loc.start + 1,
            variant.ref,
            // remove leading insertion caret
            variant.tum.replace('^', ''),
            variant.type,
            variant.hgvsP ?? '',
            variant.hgvsC ?? '',
            variant.consequence ?? '',
            // remove 1:, 2:, 3: ordering info
            variant.tDepth - variant.tAltCount,
            variant.tAltCount,
            variant.tDepth,

            variant.vaf,
            sampleMap[variant.sample]!.pairedNormalDna,
            [
              ...new Set(
                variant.datasets.map(dataset => datasetMap[dataset]?.name ?? '')
              ),
            ]
              .sort()
              .join(','),
            [
              ...new Set(
                variant.datasets.map(
                  dataset => datasetMap[dataset]?.institution ?? ''
                )
              ),
            ]
              .sort()
              .join(','),
            //sampleMap.get(variant.sample)!.type,
            cooMap.get(variant.sample) ?? '',
            lymphgenMap.get(variant.sample) ?? '',
          ]
        })
      : []

    if (data.length === 0) {
      return
    }

    const df = new AnnotationDataFrame({
      data,
      columns: [
        'Sample',
        'Chromosome',
        'Start_Position',
        'End_Position',
        'Offset',
        'Reference_Allele',
        'Tumor_Seq_Allele2',
        'Variant_Type',
        'AAChange',
        'DNAChange',
        'Variant_Classification',
        't_ref_count',
        't_alt_count',
        't_depth',
        'VAF',
        'Paired_Normal_DNA',
        'Dataset',
        'Institution',
        //'Sample_Type',
        'COO',
        'Lymphgen_Class',
      ],
    })

    openFile('Variants', { sheets: [df.setName('Variants')] })
  }, [settings, variants])

  function save(name: string, format: string) {
    if (!sheet) {
      return
    }

    const sep = format === 'csv' ? ',' : '\t'

    downloadDataFrame(df, {
      hasHeader: true,
      hasIndex: false,
      file: name,
      sep,
    })

    setShowFileMenu(false)
  }

  const tabs: ITab[] = [
    {
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            <ToolbarIconButton
              title="Download variant table to local file"
              onClick={() =>
                setShowDialog({
                  id: randId('save'),
                })
              }
            >
              <DownloadIcon />
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Download image to local file"
              onClick={() =>
                setShowDialog({
                  id: randId('export'),
                })
              }
            >
              <DownloadImageIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="View">
            <ToggleGroup
              value={[settings.view]}
              onValueChange={v => {
                console.log('view change', v)
                if (v.length > 0) {
                  updateSettings(
                    produce(settings, draft => {
                      draft.view = v[0] as 'pileup' | 'maf'
                    })
                  )
                }
              }}
              size="toolbar"
              justify="start"
              direction="toolbar"
              //multiple={true}
            >
              <GroupToggle value="pileup">Pileup</GroupToggle>

              <GroupToggle value="maf">MAF</GroupToggle>
            </ToggleGroup>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const rightTabs: ITab[] = [
    // {
    //   icon: <DatabaseIcon />,
    //   name: "Databases",
    //   content: (<MutationDBPanel databases={databases} />)
    // },
    {
      //name: nanoid(),
      //icon: <SlidersIcon />,
      id: 'Display',
      content: <PileupPropsPanel />,
    },

    {
      //name: nanoid(),
      //icon: <SlidersIcon />,
      id: 'Features',
      content: <FeaturePropsPanel />,
    },

    // {
    //   //name: nanoid(),
    //   icon: <ClockRotateLeftIcon />,
    //   id: 'History',
    //   content: <HistoryPanel branchId={branch?.id ?? ''} />,
    // },
  ]

  const fileMenuTabs: ITab[] = [
    // {
    //   id: nanoid(),
    //   name: "Open",
    //   icon: <OpenIcon fill="" />,
    //   content: (
    //     <DropdownMenuItem
    //       aria-label={TEXT_OPEN_FILE}
    //       onClick={() =>
    //         setShowDialog({ name: makeRandId("open"), params: {} })
    //       }
    //     >
    //       <UploadIcon fill="" />

    //       <span>{TEXT_OPEN_FILE}</span>
    //     </DropdownMenuItem>
    //   ),
    // },
    // { id: nanoid(), name: "<divider>" },
    {
      //name: nanoid(),
      id: TEXT_SAVE_AS,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_TXT}
            onClick={() => {
              save('variants.txt', 'txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('variants.csv', 'csv')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `variants.png`)
            }}
          >
            <FileImageIcon fill="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `variants.svg`)
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="variants"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string; format: ISaveAsFormat }
              save(d.name as string, d.format.ext)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('export') && (
        <SaveImageDialog
          name="variants"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              const d = data as { name: string }
              downloadSvgAutoFormat(svgRef, d.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <HeaderPortal>
        <ModuleInfoButton info={MODULE_INFO} />

        <LocationAutocomplete
          value={searchLocation}
          //showClear={false}
          onTextChange={v => setSearchLocation(v)}
          onTextChanged={v => {
            updateSettings(
              produce(settings, draft => {
                draft.location = parseGenomicLocation(v)
              })
            )
          }}
          onLocationChanged={location => {
            const search = locStr(location)
            setSearchLocation(search)
            updateSettings(
              produce(settings, draft => {
                draft.location = location
              })
            )
          }}
          className="w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 text-xs"
        />

        <>
          <SelectList
            variant="header"
            className="text-xs"
            w="xs"
            value={settings.assembly}
            onValueChange={value =>
              updateSettings(
                produce(settings, draft => {
                  draft.assembly = (value as string) ?? 'hg19'
                })
              )
            }
          >
            <SelectGroup>
              <SelectLabel>Genome Assembly</SelectLabel>
              <SelectItem value="hg19">hg19</SelectItem>
            </SelectGroup>
          </SelectList>
        </>
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <ShowSideButton
                open={barProps.open}
                onClick={() => setOpen(!barProps.open)}
              />
            }
            rightShortcuts={<HistoryShowButton />}
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
          <ResizableSidebar id="variants-folders" side="left" className="grow">
            <TabSlideBar
              id="variants"
              side="right"
              tabs={rightTabs}
              open={showSideBar}
              onOpenChange={setShowSideBar}
            >
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel
                  defaultSize="50%"
                  minSize="0%"
                  className="flex flex-col"
                  id="pileup"
                >
                  <Card variant="content" className="mb-2 grow">
                    <Tabs
                      value={settings.view}
                      onValueChange={v => {
                        updateSettings(
                          produce(settings, draft => {
                            draft.view = v as 'pileup' | 'maf'
                          })
                        )
                      }}
                      className="grow flex flex-col"
                    >
                      <TabsContent value="pileup" className="flex-col grow ">
                        <VScrollPanel className="grow h-full">
                          <PileupPlotPanel ref={svgRef} />
                        </VScrollPanel>
                      </TabsContent>
                      <TabsContent value="maf">
                        <MAFPanel ref={svgRef} />
                      </TabsContent>
                    </Tabs>
                  </Card>
                </ResizablePanel>
                <ThinVResizeHandle />
                <ResizablePanel
                  id="list"
                  defaultSize="50%"
                  minSize="0%"
                  collapsible={true}
                  className="flex flex-col"
                >
                  <TabbedDataFrames
                    key="tabbed-data-frames"
                    selectedSheet={sheet?.id ?? ''}
                    dataFrames={sheets.map(s => s as AnnotationDataFrame)}
                    onTabChange={selectedTab => {
                      goto({ app, file, sheet: selectedTab.tab })
                    }}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabSlideBar>

            <DatasetPanel />
          </ResizableSidebar>
        </HistoryLayout>
        <ToolbarFooterPortal className="justify-between">
          <div>{getDataFrameInfo(df)}</div>
          <></>
          <ZoomSlider
            zoom={settings.scale}
            onZoomChange={zoom => {
              updateSettings(
                produce(settings, draft => {
                  draft.scale = zoom
                })
              )
            }}
          />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function VariantsQueryPage() {
  return (
    <CoreProviders>
      <VariantsPage />
    </CoreProviders>
  )
}
