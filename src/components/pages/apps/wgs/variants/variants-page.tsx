'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'

import {
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
} from '@/consts'
import { getDataFrameInfo } from '@/lib/dataframe/dataframe-utils'

import { locStr } from '@/lib/genomic/genomic'
import { useEffect, useState } from 'react'

import { formatChr } from '@/lib/genomic/dna'

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
import { makeUuid } from '@/lib/id'
import { downloadSvgAutoFormat } from '@/lib/image-utils'

import { PileupPropsPanel } from './pileup-props-panel'

import { type ITab } from '@/components/tabs/tab-provider'

import type { ISaveAsFileType, ISaveAsResponse } from '@/dialogs/save-as-dialog'
import { FileIcon } from '@/icons/file-icon'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { ShowSideButton } from '@/components/pages/show-side-button'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { CoreProviders } from '@/providers/core-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { ResizableSidebar } from '@/components/slide-bar/resizable-sidebar'
import { useSlideBar } from '@/components/slide-bar/slide-bar-store'
import { TAB10_PALETTE } from '@/lib/color/palette'
import { AssemblySelect } from '@/lib/edb/assembly-select'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { parseGenomicLocation } from '@/lib/genomic/genomic-location'
import { produce } from 'immer'
import { MonitorDown } from 'lucide-react'
import { LocationAutocomplete } from '../../genomic/seq-browser/location-autocomplete'
import {
  HistoryLayout,
  HistoryShowButton,
} from '../../matcalc/history/history-layout'

import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-store'
import { SVGProvider, useSVG } from '@/providers/svg-provider'
import {
  useCurrentSheets,
  useFiles,
} from '../../matcalc/history/history-provider/history-contexts'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { DatasetPanel } from './dataset-panel'
import { useDatasets } from './dataset-store'
import { FeaturePropsPanel } from './feature-props-panel'
import { MAFPanel } from './maf-panel'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home-toolbar'
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

  const { settings, updateSettings } = useVariantSettings()
  const { setAppInfo } = useAppInfo()
  const { datasets, datasetMap, sampleMap } = useDatasets()
  const { variants } = useVariants()

  const [searchLocation, setSearchLocation] = useState(
    locStr(settings.location)
  )

  const { open, setOpen } = useSlideBar('variants-folders')

  const [showSideBar, setShowSideBar] = useState(true)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const { openFile, goto } = useHistory()

  const { file } = useFiles()
  const { sheet, sheets } = useCurrentSheets()
  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()
  const { svgRef } = useSVG()

  const df = sheet as AnnotationDataFrame

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [setAppInfo])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  useEffect(() => {
    setSideTabs([
      {
        id: 'Display',
        component: PileupPropsPanel,
      },
      {
        id: 'Features',
        component: FeaturePropsPanel,
      },
    ])
  }, [setSideTabs])

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
      produce(settings, (draft) => {
        draft.variants.cmap = cmap
      })
    )
  }, [datasets, settings.variants.colorBy])

  useEffect(() => {
    setSearchLocation(locStr(settings.location))
  }, [locStr(settings.location)])

  useEffect(() => {
    if (!variants) {
      return
    }

    const cooMap = new Map<string, string>(
      datasets
        .map((dataset) =>
          dataset.samples.map(
            (sample) => [sample.id, sample.coo ?? ''] as [string, string]
          )
        )
        .flat()
    )

    const lymphgenMap = new Map<string, string>(
      datasets
        .map((dataset) =>
          dataset.samples.map(
            (sample) => [sample.id, sample.lymphgenClass] as [string, string]
          )
        )
        .flat()
    )

    const loc = parseGenomicLocation(searchLocation)

    const data = variants
      ? variants.variants.map((variant) => {
          let chr = variant.chr.replace('chr', '')

          if (settings.chrPrefix.show) {
            chr = formatChr(chr) // `chr${chr}`
          }

          return [
            variant.gene,
            locStr({
              chr,
              start: variant.start,
              end: variant.end,
              strand: '+',
            }),
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
            variant.exon,
            variant.exons,
            variant.consequence ?? '',
            sampleMap[variant.sample]!.name,
            variant.transcript,
            // remove 1:, 2:, 3: ordering info
            variant.tDepth - variant.tAltCount,
            variant.tAltCount,
            variant.tDepth,

            variant.vaf,
            sampleMap[variant.sample]!.pairedNormalDna,
            [
              ...new Set(
                variant.datasets.map(
                  (dataset) => datasetMap[dataset]?.name ?? ''
                )
              ),
            ]
              .sort()
              .join(','),
            [
              ...new Set(
                variant.datasets.map(
                  (dataset) => datasetMap[dataset]?.institution ?? ''
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
        'Gene_Symbol',
        'Location',
        'Chromosome',
        'Start_Position',
        'End_Position',
        'Offset',
        'Reference_Allele',
        'Tumor_Seq_Allele2',
        'Variant_Type',
        'AAChange',
        'DNAChange',
        'Exon_Number',
        'Total_Exons',
        'Variant_Classification',
        'Sample',
        'Transcript',
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

  const fileMenuTabs: ITab[] = [
    {
      //name: nanoid(),
      id: TEXT_SAVE_AS,
      component: () => (
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
      component: () => (
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
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <LocationAutocomplete
          value={searchLocation}
          //showClear={false}
          onTextChange={(v) => setSearchLocation(v)}
          onTextChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.location = parseGenomicLocation(v)
              })
            )
          }}
          onLocationChanged={(location) => {
            const search = locStr(location)
            setSearchLocation(search)
            updateSettings(
              produce(settings, (draft) => {
                draft.location = location
              })
            )
          }}
          className="w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 text-xs"
        />

        <AssemblySelect />
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <ShowSideButton open={open} onClick={() => setOpen(!open)} />
            }
            rightShortcuts={<HistoryShowButton />}
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
        <HistoryLayout>
          <ResizableSidebar id="variants-folders" side="left" className="grow">
            <TabSlideBar
              side="right"
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
                  <Tabs
                    value={settings.view}
                    onValueChange={(v) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.view = v as 'pileup' | 'maf'
                        })
                      )
                    }}
                    className="grow flex flex-col"
                  >
                    <TabsContent value="pileup" className="flex-col grow ">
                      <ExtScrollCard>
                        <PileupPlotPanel ref={svgRef} />
                      </ExtScrollCard>
                    </TabsContent>
                    <TabsContent value="maf">
                      <MAFPanel ref={svgRef} />
                    </TabsContent>
                  </Tabs>
                </ResizablePanel>
                <ThinVResizeHandle />
                <ResizablePanel
                  id="list"
                  defaultSize="50%"
                  minSize="0%"
                  collapsible={true}
                  className="flex flex-col"
                >
                  <BaseRow className="gap-x-1 grow">
                    <BaseCol>
                      <IconButton
                        title="Download variant table to local file"
                        onClick={() => {
                          openDialog({
                            type: 'save',
                            payload: {
                              name: 'variants',
                              callback: (data: ISaveAsResponse) => {
                                const d = data as {
                                  name: string
                                  format: ISaveAsFileType
                                }
                                save(d.name, d.format.ext)
                              },
                            },
                          })
                        }}
                      >
                        <MonitorDown size={20} strokeWidth={1.5} />
                      </IconButton>
                    </BaseCol>

                    <TabbedDataFrames
                      key="tabbed-data-frames"
                      selectedSheet={sheet?.id ?? ''}
                      dataFrames={sheets.map((s) => s as AnnotationDataFrame)}
                      onTabChange={(selectedTab) => {
                        goto({ file, sheet: selectedTab.tab })
                      }}
                    />
                  </BaseRow>
                </ResizablePanel>
              </ResizablePanelGroup>
            </TabSlideBar>

            <DatasetPanel />
          </ResizableSidebar>
        </HistoryLayout>
        <FooterPortal className="justify-between">
          <div>{getDataFrameInfo(df)}</div>
          <></>
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function VariantsQueryPage() {
  return (
    <CoreProviders>
      <SVGProvider>
        <VariantsPage />
      </SVGProvider>
    </CoreProviders>
  )
}
