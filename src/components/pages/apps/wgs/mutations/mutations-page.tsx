'use client'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_CSV,
  TEXT_DOWNLOAD_AS_TXT,
  TEXT_SAVE_AS,
  type IDialogParams,
} from '@/consts'
import { ClockRotateLeftIcon } from '@icons/clock-rotate-left-icon'
import { getDataFrameInfo } from '@lib/dataframe/dataframe-utils'
import { ToolbarTabButton } from '@toolbar/toolbar-tab-button'

import { GenomicLocation, locStr } from '@lib/genomic/genomic'
import { useEffect, useRef, useState } from 'react'

import {
  API_MUTATIONS_DATABASES_URL as API_MUTATIONS_DATASETS_URL,
  API_MUTATIONS_PILEUP_URL,
} from '@lib/edb/edb'
import { fetchDNA, formatChr, type IDNA } from '@lib/genomic/dna'
import { parseLocation } from '@lib/genomic/genomic'

import { CollapseTree, makeFoldersRootNode } from '@components/collapse-tree'
import {
  PileupPlotSvg,
  type IMotifPattern,
  type IMutationDataset,
  type IMutationSample,
  type IPileupPlot,
  type IPileupResults,
} from '@components/pages/apps/wgs/mutations/pileup-plot-svg'
import { FileImageIcon } from '@icons/file-image-icon'
import { FolderIcon } from '@icons/folder-icon'
import { PlayIcon } from '@icons/play-icon'
import { SlidersIcon } from '@icons/sliders-icon'
import { BaseCol } from '@layout/base-col'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import { ResizablePanel, ResizablePanelGroup } from '@themed/resizable'

import { queryClient } from '@/query'
import { SlideBar } from '@components/slide-bar/slide-bar'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { ThinHResizeHandle } from '@components/split-pane/thin-h-resize-handle'
import { ThinVResizeHandle } from '@components/split-pane/thin-v-resize-handle'
import { TabbedDataFrames } from '@components/table/tabbed-dataframes'
import { VCenterRow } from '@layout/v-center-row'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { downloadDataFrame } from '@lib/dataframe/dataframe-utils'
import { randID } from '@lib/id'
import { downloadSvgAutoFormat } from '@lib/image-utils'

import { PileupPropsPanel } from './pileup-props-panel'

import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SaveTxtDialog } from '@components/pages/save-txt-dialog'
import { type ITab } from '@components/tabs/tab-provider'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@components/v-scroll-panel'

import type { ISaveAsFormat } from '@components/pages/save-as-dialog'
import { FileIcon } from '@icons/file-icon'
import { Card } from '@themed/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'

import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadIcon } from '@/components/icons/download-icon'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import { ShowSideButton } from '@components/pages/show-side-button'
import { COLOR_BLACK, COLOR_RED } from '@lib/color/color'
import { AnnotationDataFrame } from '@lib/dataframe/annotation-dataframe'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders } from '@lib/http/urls'
import { toast } from '@themed/crisp'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'
import { LocationAutocomplete } from '../../genomic/seq-browser/location-autocomplete'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import { HistoryPanel } from '../../matcalc/history/history-panel'
import { useHistory } from '../../matcalc/history/history-store'
import MODULE_INFO from './module.json'
import { useMutations } from './mutation-store'

export const DEFAULT_MOTIF_PATTERNS: IMotifPattern[] = [
  {
    name: 'AID',
    regex: /(?:[AG]G[CT][AT])|(?:[AT][AG]C[CT])/g,
    color: COLOR_RED,
    bgColor: COLOR_RED,
    bgOpacity: 0.1,
    show: true,
  },
]

export function MutationsPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const [search, setSearch] = useState('chr3:187462653-187462712')
  // Order the display based on the drag list re-ordering

  const [rightTab, setRightTab] = useState('Search')

  //const [colorMapName, setColorMap] = useState("Lymphgen")
  const [sampleColorMap, setSampleColorMap] = useState<Map<string, string>>(
    new Map<string, string>()
  )

  //const [databases, setDatabases] = useState<IMutationDB[]>([])

  //const searchRef = useRef<HTMLTextAreaElement>(null)
  const [pileup, setPileup] = useState<IPileupPlot | null>(null)
  const [foldersIsOpen, setFoldersIsOpen] = useState(true)
  const [tab, setTab] = useState<ITab | undefined>(undefined)
  const [samples, setSamples] = useState<IMutationSample[]>([])
  const [datasetUseMap, setDatasetUseMap] = useState<Map<string, boolean>>(
    new Map<string, boolean>()
  )

  const [assembly, setAssembly] = useState('hg19')

  const { fetchAccessToken } = useEdbAuth()

  const [sampleMap, setSampleMap] = useState<Map<string, IMutationSample>>(
    new Map<string, IMutationSample>()
  )
  const [foldersTab, setFoldersTab] = useState<ITab>({
    ...makeFoldersRootNode(),
  })

  //const [addChrPrefix, setAddChrPrefix] = useState(true)

  const [showSideBar, setShowSideBar] = useState(true)

  const svgRef = useRef<SVGSVGElement>(null)

  const [datasets, setDatasets] = useState<IMutationDataset[]>([])

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { settings } = useMutations()

  const { branch, sheet, sheets, openBranch, gotoSheet } = useHistory()

  const [motifPatterns, setMotifPatterns] = useState<IMotifPattern[]>([
    ...DEFAULT_MOTIF_PATTERNS,
  ])

  // const dbQuery = useQuery({
  //   queryKey: ["datasets"],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     console.log(API_MUTATIONS_DATASETS_URL)

  //     const res = await axios.get(
  //       `${API_MUTATIONS_DATASETS_URL}/${assembly}`,
  //       {},
  //     )

  //     return res.data
  //   },
  // })

  async function loadDatasets() {
    const res = await queryClient.fetchQuery({
      queryKey: ['datasets'],
      queryFn: () => {
        return httpFetch.getJson<{ data: IMutationDataset[] }>(
          `${API_MUTATIONS_DATASETS_URL}/${assembly}`
        )
      },
    })

    console.log('ds', res.data)

    const datasets: IMutationDataset[] = res.data

    setDatasets(datasets)

    setDatasetUseMap(
      new Map<string, boolean>(
        datasets.map((dataset) => [dataset.publicId, true])
      )
    )
  }

  useEffect(() => {
    try {
      loadDatasets()
    } catch (error) {
      console.log(error)
    }
  }, [assembly])

  useEffect(() => {
    setSampleMap(
      new Map<string, IMutationSample>(
        datasets
          .map((dataset) =>
            dataset.samples.map(
              (sample) => [sample.publicId, sample] as [string, IMutationSample]
            )
          )
          .flat()
      )
    )
  }, [datasets])

  useEffect(() => {
    const children: ITab[] = datasets.map((dataset) => {
      return {
        id: dataset.publicId,
        name: dataset.name,
        icon: <FolderIcon />,
        isOpen: true,
        data: dataset.samples,
        checked: datasetUseMap.get(dataset.publicId),
        // onCheckedChange: (state: boolean) => {
        //   onCheckedChange(dataset, state)
        // },
      } as ITab
    })

    const tab: ITab = {
      ...makeFoldersRootNode(),
      children: [{ id: 'datasets', name: 'Datasets', children, isOpen: true }],
    }

    //console.log(tab, datasetUseMap)

    setFoldersTab(tab)
  }, [datasets, datasetUseMap])

  useEffect(() => {
    if (!(settings.cmap in settings.cmaps)) {
      return
    }

    let cmap: Record<string, string> = settings.cmaps['COO']

    switch (settings.cmap) {
      case 'Lymphgen':
        cmap = settings.cmaps['Lymphgen']
        break
      case 'SNP':
        cmap = settings.cmaps['SNP']
        break
      default:
        cmap = settings.cmaps['COO']
        break
    }

    if (settings.cmap === 'Lymphgen') {
      cmap = settings.cmaps['Lymphgen']
    }

    // sample color map
    let scm: Map<string, string> | null = null

    switch (settings.cmap) {
      case 'COO':
        scm = new Map<string, string>(
          datasets
            .map((d) => d.samples)
            .flat()
            .map((s) => [
              s.publicId,
              s.coo in cmap ? cmap[s.coo]! : COLOR_BLACK,
            ])
        )

        console.log(scm)

        break
      case 'Lymphgen':
        scm = new Map<string, string>(
          datasets

            .map((d) => d.samples)
            .flat()
            .map((s) => [
              s.publicId,
              s.lymphgen in cmap ? cmap[s.lymphgen]! : COLOR_BLACK,
            ])
        )

        break
      case 'SNP':
        scm = new Map<string, string>(Object.entries(cmap))
        break
      default:
        scm = new Map<string, string>()
        break
    }

    if (scm) {
      setSampleColorMap(scm)
    }
  }, [datasets, settings])

  useEffect(() => {
    setSamples(
      datasets
        .filter((dataset) => datasetUseMap.get(dataset.publicId))
        .map((d) => d.samples)
        .flat()
        .sort((sa, sb) => sa.name.localeCompare(sb.name))
    )
  }, [datasets, datasetUseMap, tab])

  function loadTestData() {
    setSearch('chr3:187462653-187462712')
  }

  async function fetchPileup(
    location: GenomicLocation,
    datasets: IMutationDataset[]
  ): Promise<IPileupResults> {
    let ret: IPileupResults = { location, pileup: [] }

    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      toast({
        title: 'WGS Mutations',
        description:
          'You do not have permission to download data from this module. Please contact your adminstrator to get access.',
        variant: 'destructive',
      })

      return ret
    }

    //console.log(location, datasets, accessToken)

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['pileup'],
        queryFn: () => {
          return httpFetch.postJson<{ data: IPileupResults }>(
            `${API_MUTATIONS_PILEUP_URL}/${assembly}`,
            {
              body: {
                locations: [location.toString()],
                datasets: datasets.map((dataset) => dataset.publicId),
              },

              headers: bearerHeaders(accessToken),
            }
          )
        },
      })

      ret = res.data
    } catch (error) {
      console.error(error)
    }

    return ret
  }

  /**
   * Fetch pileup data for a given genomic location.
   *
   * @param search genomic location string e.g. chr1:1000-2000
   * @returns
   */
  async function getPileup(search: string) {
    try {
      const location = parseLocation(search)

      if (!location) {
        return
      }

      let dna: IDNA = { location, seq: '' }

      dna = await fetchDNA(queryClient, location, {
        format: 'Upper',
        assembly: 'hg19',
      })

      let pileup: IPileupResults = { location, pileup: [] }

      //console.log(dbIndex, dbQuery)
      //console.log(`${dbQuery.data[dbIndex].assembly}:${dbQuery.data[database].name}`)

      pileup = await fetchPileup(
        location,
        datasets.filter((dataset) => datasetUseMap.get(dataset.publicId))
      )

      setPileup({ dna, pileupResults: pileup })
    } catch (e) {
      console.log(e)
    }
  }

  useEffect(() => {
    if (!pileup) {
      return
    }
  }, [pileup])

  useEffect(() => {
    if (!pileup) {
      return
    }

    const datasetMap = new Map<string, string>(
      datasets
        .map((dataset) =>
          dataset.samples.map(
            (sample) => [sample.publicId, dataset.name] as [string, string]
          )
        )
        .flat()
    )

    const cooMap = new Map<string, string>(
      datasets
        .map((dataset) =>
          dataset.samples.map(
            (sample) => [sample.publicId, sample.coo] as [string, string]
          )
        )
        .flat()
    )

    const lymphgenMap = new Map<string, string>(
      datasets
        .map((dataset) =>
          dataset.samples.map(
            (sample) => [sample.publicId, sample.lymphgen] as [string, string]
          )
        )
        .flat()
    )

    const loc = parseLocation(search)

    const data =
      pileup && pileup.pileupResults
        ? pileup.pileupResults.pileup.flat().map((mutation) => {
            let chr = mutation.chr.replace('chr', '')

            if (settings.chrPrefix.show) {
              chr = formatChr(chr) // `chr${chr}`
            }

            return [
              sampleMap.get(mutation.sample)!.name,
              chr,
              mutation.start,
              mutation.end,
              mutation.start - loc.start + 1,
              mutation.ref,
              // remove leading insertion caret
              mutation.tum.replace('^', ''),
              mutation.type.slice(2),
              // remove 1:, 2:, 3: ordering info
              mutation.tDepth - mutation.tAltCount,
              mutation.tAltCount,
              mutation.tDepth,

              mutation.vaf,
              sampleMap.get(mutation.sample)!.pairedNormalDna,
              datasetMap.get(mutation.sample) ?? '',
              sampleMap.get(mutation.sample)!.institution,
              sampleMap.get(mutation.sample)!.sampleType,
              cooMap.get(mutation.sample) ?? '',
              lymphgenMap.get(mutation.sample) ?? '',
            ]
          })
        : []

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
        't_ref_count',
        't_alt_count',
        't_depth',
        'VAF',
        'Paired_Normal_DNA',
        'Dataset',
        'Institution',
        'Sample_Type',
        'COO',
        'Lymphgen',
      ],
    })

    openBranch('Mutations', [df.setName('Mutations')])
  }, [settings, pileup])

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

  const tabs: ITab[] = [
    {
      ////name: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title="File">
            {/* <ToolbarOpenFile
              onOpenChange={open => {
                if (open) {
                  setShowDialog({
                    name: makeRandId("open"),
                    
                  })
                }
              }}
              multiple={true}
              fileTypes={["motif", "motifs"]}
            /> */}

            <ToolbarIconButton
              title="Download matrix to local file"
              onClick={() =>
                setShowDialog({
                  id: randID('save'),
                })
              }
            >
              <DownloadIcon />
            </ToolbarIconButton>

            <ToolbarIconButton
              title="Download image to local file"
              onClick={() =>
                setShowDialog({
                  id: randID('export'),
                })
              }
            >
              <DownloadImageIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Mutations">
            <ToolbarIconButton
              title="Fetch mutations"
              onClick={() => {
                try {
                  getPileup(search)
                } catch (e) {
                  console.log(e)
                }
              }}
            >
              <PlayIcon />
            </ToolbarIconButton>
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
      icon: <SlidersIcon />,
      id: 'Display',
      content: (
        <PileupPropsPanel
          motifPatterns={motifPatterns}
          onMotifPatternsChange={(patterns) => setMotifPatterns(patterns)}
        />
      ),
    },

    {
      //name: nanoid(),
      icon: <ClockRotateLeftIcon />,
      id: 'History',
      content: <HistoryPanel branchId={branch?.id ?? ''} />,
    },
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
              save('mutations.txt', 'txt')
            }}
          >
            <FileIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_TXT}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label="Download as CSV"
            onClick={() => {
              save('mutations.csv', 'csv')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_CSV}</span>
          </DropdownMenuItem>
        </>
      ),
    },
    {
      //name: nanoid(),
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `mutations.png`)
            }}
          >
            <FileImageIcon fill="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `mutations.svg`)
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  return (
    <>
      {showDialog.id.includes('save') && (
        <SaveTxtDialog
          name="mutations"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              save(data!.name as string, (data!.format as ISaveAsFormat).ext)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      {showDialog.id.includes('export') && (
        <SaveImageDialog
          name="mutations"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />
          {/* <SearchBox
            value={search}
            onTextChange={(v) => setSearch(v)}
            onTextChanged={() => {
              getPileup()
            }}
            variant="header"
            h="header"
            w=" w-1/4 text-xs"
          /> */}

          <>
            <LocationAutocomplete
              value={search}
              //showClear={false}
              onTextChange={(v) => setSearch(v)}
              onTextChanged={(v) => {
                getPileup(v)
              }}
              onLocationChanged={(feature) => {
                const search = locStr(feature.loc)
                setSearch(search)
                getPileup(search)
              }}
              className="w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 text-xs"
            />
          </>

          <Select value={assembly} onValueChange={setAssembly}>
            <SelectTrigger
              variant="header"
              className="text-sm"
              title="Select Genome"
            >
              <SelectValue placeholder="Select a genome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hg19">hg19</SelectItem>
              {/* <SelectItem value="grch38">grch38</SelectItem> */}
            </SelectContent>
          </Select>
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={
              <ShowSideButton
                onClick={() => setFoldersIsOpen(!foldersIsOpen)}
              />
            }
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
        {/* <div className="grow">
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            id="tables"
            defaultSize={75}
            minSize={50}
            className="flex flex-col gap-y-4"
          >
            <HCenterRow>
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-96 rounded-full"
                rightChildren={
                  <button onClick={getPileup}>
                    <SearchIcon />
                  </button>
                }
              />
            </HCenterRow>
 

            <div className="custom-scrollbar relative overflow-scroll rounded-lg border border-border bg-white">
              <PileupPlotSvg
                db={
                  dbQuery.data && dbQuery.data.length > 0
                    ? dbQuery.data[database]
                    : null
                }
                ref={svgRef}
                plot={pileup}
                settings={settings}
                motifPatterns={motifPatterns}
              />
            </div>
          </ResizablePanel>
          <HResizeHandle />
          <ResizablePanel className="flex flex-col pl-2 pr-4" id="right-tabs">
            <SideBarTabs
              tabs={rightTabs}
              value={rightTab}
              onTabChange={selectedTab=>setRightTab(selectedTab.tab.name)}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div> */}

        <SlideBar
          id="mutations-folders"
          open={foldersIsOpen}
          onOpenChange={setFoldersIsOpen}
          limits={[15, 85]}
          initialPosition={10}
          side="left"
          className="grow"
        >
          {/* <SlideBarContent className="grow" /> */}

          <TabSlideBar
            id="mutations"
            side="right"
            tabs={rightTabs}
            value={rightTab}
            onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
            open={showSideBar}
            onOpenChange={setShowSideBar}
          >
            <ResizablePanelGroup direction="horizontal">
              <ResizablePanel
                id="sample-list"
                defaultSize={20}
                minSize={10}
                maxSize={90}
                className="flex flex-col bg-background/75 py-3 rounded-theme overflow-hidden mb-2 border border-border/50"
              >
                <VCenterRow className="px-3 pb-2 border-b border-border/50 justify-between text-xs">
                  <span>{samples.length} samples</span>
                </VCenterRow>
                <VScrollPanel asChild={true}>
                  <ul className={V_SCROLL_CHILD_CLS}>
                    {samples.map((sample, si) => {
                      return (
                        <li
                          key={si}
                          className="flex flex-row items-start text-xs gap-x-3 px-3 py-2 border-b border-border"
                        >
                          <BaseCol>
                            <p className="font-semibold">{sample.name}</p>
                            <p>
                              {sample.coo}, {sample.lymphgen}
                            </p>
                          </BaseCol>
                        </li>
                      )
                    })}
                  </ul>
                </VScrollPanel>
              </ResizablePanel>
              <ThinHResizeHandle />
              <ResizablePanel className="flex flex-col" id="right-tabs">
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel
                    defaultSize={75}
                    minSize={10}
                    className="flex flex-col"
                    id="pileup"
                  >
                    <Card variant="content" className="mx-2 mb-2 grow">
                      <div className={PLOT_CLS}>
                        {pileup && (
                          <PileupPlotSvg
                            ref={svgRef}
                            sampleMap={sampleMap}
                            plot={pileup}
                            motifPatterns={motifPatterns}
                            colorMap={sampleColorMap}
                          />
                        )}
                      </div>
                    </Card>
                  </ResizablePanel>
                  <ThinVResizeHandle />
                  <ResizablePanel
                    id="list"
                    defaultSize={25}
                    minSize={10}
                    collapsible={true}
                    className="flex flex-col"
                  >
                    {/* <BaseRow className="grow gap-x-1">
                      <BaseCol>
                        <ToolbarButton
                          title="Save mutation table"
                          onClick={() =>
                            setShowDialog({
                              id: randID('save'),
                            })
                          }
                        >
                          <SaveIcon />
                        </ToolbarButton>
                      </BaseCol> */}

                    <TabbedDataFrames
                      key="tabbed-data-frames"
                      selectedSheet={sheet?.id ?? ''}
                      dataFrames={sheets as AnnotationDataFrame[]}
                      onTabChange={(selectedTab) => {
                        gotoSheet(selectedTab.tab.id)
                      }}
                    />
                    {/* </BaseRow> */}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </TabSlideBar>

          <VScrollPanel>
            <CollapseTree
              tab={foldersTab}
              //value={tab!}
              onValueChange={(t) => {
                // only use tabs from the tree that have content, otherwise
                // the ui will appear empty
                setTab(t)
              }}
              onCheckedChange={(tab: ITab, state: boolean) => {
                const tabId = tab.id //getTabId(tab)

                console.log(tab.id)

                setDatasetUseMap(
                  new Map<string, boolean>([
                    ...datasetUseMap.entries(),
                    [tabId, state],
                  ])
                )
              }}
              showRoot={false}
            />
          </VScrollPanel>
        </SlideBar>

        <ToolbarFooterPortal className="justify-between">
          <div>{getDataFrameInfo(sheet!)}</div>
          <></>
          {/* <ZoomSlider scaleIndex={scaleIndex} onZoomChange={adjustScale} /> */}
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}
