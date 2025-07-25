 'use client'

import { ToolbarFooterPortal } from '@toolbar/toolbar-footer-portal'
import { ToolbarOpenFile } from '@toolbar/toolbar-open-files'
import { ZoomSlider } from '@toolbar/zoom-slider'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@toolbar/toolbar'
import { ToolbarIconButton } from '@toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@toolbar/toolbar-separator'

import { SearchIcon } from '@icons/search-icon'

import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_SAVE_IMAGE,
  type IDialogParams,
} from '@/consts'
import { TabSlideBar } from '@components/slide-bar/tab-slide-bar'
import { ChevronRightIcon } from '@icons/chevron-right-icon'
import { API_GENOME_GENOMES_URL } from '@lib/edb/edb'
import { GenomicLocation } from '@lib/genomic/genomic'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
import { ToolbarOptionalDropdownButton } from '@toolbar/toolbar-optional-dropdown-button'
import { ToolbarTabGroup } from '@toolbar/toolbar-tab-group'

import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { type ITab } from '@components/tabs/tab-provider'
import { FileImageIcon } from '@icons/file-image-icon'
import { downloadSvgAutoFormat } from '@lib/image-utils'
import { randId } from '@lib/utils'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import { DropdownMenuItem } from '@themed/dropdown-menu'
import MODULE_INFO from './module.json'

import { TracksPropsPanel } from './tracks-props-panel'
import { TracksContext, TracksProvider } from './tracks-provider'

import { CompassIcon } from '@icons/compass-icon'
import { CubeIcon } from '@icons/cube-icon'
import { LayersIcon } from '@icons/layers-icon'

import { useKeyDownListener } from '@/hooks/keydown-listener'
import { useZoom } from '@/providers/zoom-provider'
import { useKeyUpListener } from '@hooks/use-keyup-listener'
import { ArrowLeftRightIcon } from '@icons/arrow-left-right-icon'
import { SettingsIcon } from '@icons/settings-icon'
import { ZoomInIcon } from '@icons/zoom-in-icon'
import { ZoomOutIcon } from '@icons/zoom-out-icon'
import { VCenterRow } from '@layout/v-center-row'
import { ShortcutLayout } from '@layouts/shortcut-layout'
import { httpFetch } from '@lib/http/http-fetch'
import { cn } from '@lib/shadcn-utils'
import { Card } from '@themed/card'
import { ToolbarFooterButton } from '@toolbar/toolbar-footer-button'

import { useSettingsTabs } from '@/components/dialog/settings/setting-tabs-store'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { HeaderPortal } from '@components/header/header-portal'
import { ModuleInfoButton } from '@components/header/module-info-button'
import { useSearch } from '@hooks/use-search'
import { DownloadIcon } from '@icons/download-icon'
import { ExportIcon } from '@icons/export-icon'
import * as SelectPrimitive from '@radix-ui/react-select'
import { produce } from 'immer'
import type { IGeneDbInfo } from '../annotate/annotate-page'
import { LocationAutocomplete } from './location-autocomplete'
import { LocationsPropsPanel } from './locations/locations-props-panel'
import {
  useSeqBrowserSettings,
  type BinSize,
  type GeneDisplay,
} from './seq-browser-settings'
import { SettingsPlotPanel } from './settings/settings-plot-panel'
import { SettingsTracksPanel } from './settings/settings-tracks-panel'
import { TracksView, type GenesMap } from './svg/tracks-view'

export function SeqBrowserPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const { locations, binSizes, setLocations } = useContext(TracksContext)
  const { settings, updateSettings } = useSeqBrowserSettings()
  //const { tooltip } = useTooltip()
  const { zoom } = useZoom()

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  // useEffect(() => {
  //   if (apiKey !== '') {
  //     //save key to settings for ease of use
  //     updateSettings({ apiKey })
  //   }
  // }, [apiKey])

  //useMouseUpListener(handleMouseUp)

  const { query, setQuery } = useSearch()

  //const [results, setResults] = useState<IGenomicFeature[]>([])

  const svgRef = useRef<SVGSVGElement>(null)

  //const [binWidth, setBinWidth] = useState(1000)
  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showSideBar, setShowSideBar] = useState(true)

  //console.log('bin size', binSize)

  //const isSelecting = useRef<IPos | null>(null)
  //const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  //const isChangingLocViaDrag = useRef<IPos | null>(null)

  //const currentMousePosition = useRef<IPos | null>(null)
  //const dragStartPosition = useRef<IPos | null>(null)
  //const [dragPosition, setDragPosition] = useState<IPos | null>(null)
  //const currentLocation = useRef<GenomicLocation | null>(null)

  //const { location } = useContext(LocationContext)

  function setLocationZoom(scale: number) {
    setLocations(
      locations.map(location => {
        const w = Math.round(
          Math.max(100, (location.end - location.start + 1) * scale)
        )
        const s = Math.round((location.start + location.end) / 2 - w / 2)

        return new GenomicLocation(location.chr, s, s + w)
      })
    )
  }

  useKeyDownListener(e => {
    if ((e as KeyboardEvent).ctrlKey) {
      setIsCtrlPressed(true) // Ctrl key is pressed
    }

    //if (e.shiftKey) {
    //  setIsShiftPressed(true) // Ctrl key is pressed
    //}
  })

  useKeyUpListener(() => {
    setIsCtrlPressed(false)
    //setIsShiftPressed(false)
  })

  // const { data: geneData } = useQuery({
  //   queryKey: ['gene-search', settings.genome, query],
  //   queryFn: async () => {
  //     if (query.length < 2 || query.includes('chr:')) {
  //       return []
  //     }

  //     try {
  //       const res = await httpFetch.getJson<{
  //         data: IGenomicFeature[]
  //       }>(
  //         `${API_GENOME_INFO_URL}/${settings.genome}?search=${query}&level=gene&mode=fuzzy`
  //       )

  //       //console.log('search genes', res.data)

  //       return res.data
  //     } catch (e) {
  //       console.log(e)
  //       return []
  //     }
  //   },
  // })

  // useEffect(() => {
  //   if (geneData) {
  //     // setResults(
  //     //   geneData.sort((a, b) =>
  //     //     (a.geneSymbol ?? '').localeCompare(b.geneSymbol ?? '')
  //     //   )
  //     // )

  //     setResults(geneData)
  //   }
  // }, [geneData])

  useEffect(() => {
    const settingsTabs: ITab[] = [
      {
        id: MODULE_INFO.name,
        icon: <CubeIcon fill="" />,
        children: [
          {
            id: 'Plot',
            icon: <CompassIcon />,
            content: <SettingsPlotPanel />,
          },
          {
            id: 'Tracks',
            icon: <LayersIcon />,
            content: <SettingsTracksPanel />,
          },
        ],
      },
    ]

    setSettingsTabs(settingsTabs)
    setDefaultSettingsTab(MODULE_INFO.name)

    setQuery(['chr3:187441954-187466041'])
  }, [])

  // const xax = useMemo(
  //   () =>
  //     new Axis()
  //       .setDomain([locations[0]!.start, locations[0]!.end])
  //       .setLength(settings.plot.width)
  //       .setTicks([locations[0]!.start, locations[0]!.end]),
  //   [locations]
  // )

  // useEffect(() => {
  //   window.addEventListener('mouseup', handleMouseUp)

  //   return () => {
  //     window.removeEventListener('mouseup', handleMouseUp)
  //   }
  // }, [xax])

  // function handleMouseDown(e: React.MouseEvent) {
  //   const { clientX, currentTarget } = e
  //   const x = clientX - currentTarget.getBoundingClientRect().left

  //   //setPosition({ x, y: 0 })

  //   if (e.ctrlKey) {
  //     isSelecting.current = { x, y: 0 }
  //     //setCtrlKeyIsPressed(true)
  //   }

  //   //if (e.shiftKey) {
  //   //  isChangingLocViaDrag.current = { x, y: 0 }
  //   //}

  //   dragStartPosition.current = { x, y: 0 }
  //   currentLocation.current = locations[0]!

  //   window.addEventListener('mousemove', handleMouseMove)
  //   //window.addEventListener('mouseup', handleMouseUp)
  // }

  // function handleMouseUp(e: MouseEvent) {
  //   if (isSelecting.current) {
  //     const { clientX, target } = e
  //     const x = clientX - (target as HTMLElement).getBoundingClientRect().left

  //     const start = isSelecting.current.x - settings.margin.left
  //     const end = x - settings.margin.left

  //     const rangeX1 = xax.rangeToDomain(start)
  //     const rangeX2 = xax.rangeToDomain(end)

  //     // user must select a region of at least 1kb before selection system
  //     // works, otherwise too sensitive
  //     if (Math.abs(rangeX1 - rangeX2) > 1000) {
  //       setLocations([new GenomicLocation(locations[0]!.chr, rangeX1, rangeX2)])
  //     }
  //   }

  //   //setPosition(null)
  //   isSelecting.current = null
  //   //currentMousePosition.current = null
  //   //isChangingLocViaDrag.current = null
  //   currentLocation.current = null
  //   dragStartPosition.current = null
  //   //setCtrlKeyIsPressed(false)

  //   //window.removeEventListener('mousemove', handleMouseMove)
  //   //window.removeEventListener('mouseup', handleMouseUp)
  // }

  // function handleMouseMove(e: MouseEvent) {
  //   // only update when mouse down
  //   if (dragStartPosition.current) {
  //     const { clientX, target } = e
  //     const x = clientX - (target as HTMLElement).getBoundingClientRect().left

  //     //currentMousePosition.current = { x, y: 0 }

  //     if (isSelecting.current) {
  //       setDragPosition({ x, y: 0 })
  //     }

  //     // else if (isChangingLocViaDrag.current) {
  //     //   const f = (xax.domain[1] - xax.domain[0] + 1) / xax.length

  //     //   const pixToBp = (e.clientX - dragStartPosition.current!.x) * f

  //     //   setLocation(
  //     //     new GenomicLocation(
  //     //       currentLocation.current!.chr,
  //     //       currentLocation.current!.start - pixToBp,
  //     //       currentLocation.current!.end - pixToBp
  //     //     )
  //     //   )
  //     // } else {
  //     //   // do nothing
  //     // }
  //   }
  // }

  // useEffect(() => {
  //   if (isSelecting) {
  //     window.addEventListener('mousemove', handleMouseMove)
  //     window.addEventListener('mouseup', handleMouseUp)
  //   } else {
  //     window.removeEventListener('mousemove', handleMouseMove)
  //     window.removeEventListener('mouseup', handleMouseUp)
  //   }

  //   return () => {
  //     window.removeEventListener('mousemove', handleMouseMove)
  //     window.removeEventListener('mouseup', handleMouseUp)
  //   }
  // }, [isSelecting])

  // function adjustScale(scale: number) {
  //   setScale(scale)
  //   updateSettings({ ...settings, zoom: scale })
  // }

  useEffect(() => updateSettings({ ...settings, zoom }), [zoom])

  // const tracksQuery = useQuery({
  //   queryKey: ['tracks'],
  //   queryFn: async () => {
  //     const accessToken = await fetchAccessToken()

  //     //const token = await loadAccessToken()
  //     //console.log(API_SEQS_SEARCH_URL)

  //     const res = await httpFetch.getJson(`${API_SEQS_SEARCH_URL}/${genome}`, {
  //       headers: bearerHeaders(accessToken),
  //     })

  //     //console.log('Tracks', res)

  //     return res.data
  //   },
  // })

  useEffect(() => {
    setQuery(
      locations.map(location => {
        return `${location.chr}:${location.start}-${location.end}`
      })
    ) //.join(','))
  }, [locations])

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGeneDbInfo[] }>(
        API_GENOME_GENOMES_URL
      )

      return res.data
    },
  })

  const genesMap: GenesMap = useMemo(
    () =>
      Object.fromEntries(
        genomesQuery.data
          ? genomesQuery.data.map(
              (g: IGeneDbInfo) => [g.genome, g] as [string, IGeneDbInfo]
            )
          : []
      ),
    [genomesQuery.data]
  )

  // const testQuery = useQuery({
  //   queryKey: ['gene-info2'],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()
  //     let res:unknown

  //     // res = await axios.post(
  //     //   `${SESSION_INIT_URL} `,

  //     //   {
  //     //     headers: JSON_HEADERS,

  //     //     withCredentials: true,
  //     //   }
  //     // )

  //     //  console.log('session 1' ,res)

  //     // res = await axios.get(
  //     //   SESSION_READ_URL,

  //     //   {
  //     //     headers: JSON_HEADERS,
  //     //     withCredentials: true,
  //     //   }
  //     // )

  //     console.log('session 2 ', res)

  //     res = await fetchJsonData(SESSION_READ_URL, {
  //       credentials: 'include',
  //     })

  //     console.log('session 3 ', res)

  //     return res
  //   },
  // })

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `tracks.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as SVG"
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `tracks.svg`)
            }}
          >
            <span>Download as SVG</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

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
                  // setShowDialog({
                  //   name: makeRandId("open"),
                  //
                  // })
                }
              }}
              multiple={true}
            />

            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() =>
                setShowDialog({
                  id: randId('save'),
                })
              }
            >
              <DownloadIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Zoom">
            <ToolbarOptionalDropdownButton
              size="toolbar-icon"
              icon={<ZoomInIcon />}
              onMainClick={() => {
                setLocationZoom(0.5)
              }}
              title="Zoom In 2x"
            >
              <DropdownMenuItem
                aria-label="Zoom In 2x"
                onClick={() => {
                  setLocationZoom(0.5)
                }}
              >
                Zoom In 2x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom In 3x"
                onClick={() => {
                  setLocationZoom(1 / 3)
                }}
              >
                Zoom In 3x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom In 4x"
                onClick={() => {
                  setLocationZoom(0.25)
                }}
              >
                Zoom In 4x
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>

            <ToolbarOptionalDropdownButton
              size="toolbar-icon"
              icon={<ZoomOutIcon />}
              onMainClick={() => {
                setLocationZoom(2)
              }}
              title="Zoom Out 2x"
            >
              <DropdownMenuItem
                aria-label="Zoom Out 2x"
                onClick={() => {
                  setLocationZoom(2)
                }}
              >
                Zoom Out 2x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom Out 3x"
                onClick={() => {
                  setLocationZoom(3)
                }}
              >
                Zoom Out 3x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom Out 4x"
                onClick={() => {
                  setLocationZoom(4)
                }}
              >
                Zoom Out 4x
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Move">
            <ToolbarIconButton
              title="Move Left"
              onClick={() => {
                setLocations(
                  locations.map(location => {
                    const w = location.end - location.start + 1
                    const s =
                      location.start -
                      Math.pow(10, Math.max(2, Math.floor(Math.log10(w)) - 1)) *
                        2

                    return new GenomicLocation(location.chr, s, s + w)
                  })
                )
              }}
            >
              <ChevronRightIcon className="-scale-100" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title="Move Right"
              onClick={() => {
                setLocations(
                  locations.map(location => {
                    const w = location.end - location.start + 1
                    const s =
                      location.start +
                      Math.pow(10, Math.max(2, Math.floor(Math.log10(w)) - 1)) *
                        2

                    return new GenomicLocation(location.chr, s, s + w)
                  })
                )
              }}
            >
              <ChevronRightIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />

          <ToolbarTabGroup title="Genes" className="gap-x-2 text-sm">
            <Select
              value={settings.genes.display}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.genes.display = v as GeneDisplay
                })

                updateSettings(newSettings)
              }}
            >
              <SelectTrigger className="w-20" variant="toolbar">
                <SelectValue placeholder="Choose display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dense">Dense</SelectItem>
                <SelectItem value="pack">Pack</SelectItem>
                <SelectItem value="full">Full</SelectItem>
              </SelectContent>
            </Select>

            <ToolbarCol>
              <ToolbarButton
                //rounded="none"
                checked={settings.genes.view === 'transcript'}
                onClick={() => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.view = 'transcript'
                  })
                  updateSettings(newSettings)
                }}
                title="Transcript View"
              >
                Transcripts
              </ToolbarButton>
              <ToolbarButton
                //rounded="none"
                checked={settings.genes.view === 'exon'}
                onClick={() => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.view = 'exon'
                  })
                  updateSettings(newSettings)
                }}
                title="Exon View"
              >
                Exons
              </ToolbarButton>

              {/* <Tabs
                value={settings.genes.view}
                onValueChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.view = v as GeneView
                  })

                  updateSettings(newSettings)
                }}
              >
                <IOSTabsList
                  defaultWidth="80px"
                  value={settings.genes.view}
                  tabs={[
                    { id: 'transcript', name: 'Transcripts' },
                    { id: 'exon', name: 'Exons' },
                  ]}
                />
              </Tabs> */}
            </ToolbarCol>

            <ToolbarSeparator />

            <ToolbarCol className="gap-0.5">
              <ToolbarButton
                checked={settings.genes.canonical.only}
                onClick={() => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.canonical.only = !settings.genes.canonical.only
                  })

                  updateSettings(newSettings)
                }}
                title="Show only canonical transcripts"
              >
                Canonical
              </ToolbarButton>

              <ToolbarButton
                checked={settings.genes.types === 'protein-coding'}
                onClick={() => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.types =
                      settings.genes.types === 'protein-coding'
                        ? 'all'
                        : 'protein-coding'
                  })

                  updateSettings(newSettings)
                }}
                title="Show only canonical transcripts"
              >
                Protein coding
              </ToolbarButton>
            </ToolbarCol>

            <ToolbarIconButton
              title="Reverse"
              checked={settings.reverse}
              onClick={() => {
                const newOptions = produce(settings, draft => {
                  draft.reverse = !draft.reverse
                })

                updateSettings(newOptions)
              }}
            >
              <ArrowLeftRightIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>
          <ToolbarSeparator />
        </>
      ),
    },
  ]

  const chartTabs: ITab[] = [
    {
      id: 'Tracks',
      icon: <SearchIcon />,
      content: <TracksPropsPanel />,
    },
    {
      id: 'Locations',
      icon: <SettingsIcon />,
      content: <LocationsPropsPanel />,
    },
    // {
    //   id: TEXT_ACCOUNT,
    //   icon: <SlidersIcon />,
    //   content: <AccountPropsPanel />,
    // },
  ]

  return (
    <>
      {showDialog.id.includes('save') && (
        <SaveImageDialog
          name="tracks"
          onResponse={(response, data) => {
            if (response !== TEXT_CANCEL) {
              downloadSvgAutoFormat(svgRef, data!.name as string)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout
        //info={MODULE_INFO}

        //apiKey={settings.apiKey}
        //signInMode="api"
        //
        signedRequired="never"
      >
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <>
            {/* <SearchBox
              variant="header"
              h="header"
              value={search.ids[0] ?? ''}
              onTextChange={t => {
                updateSearch(
                  produce(search, draft => {
                    draft.ids = [t]
                  })
                )
              }}
              onSearch={async event => {
                if (event === 'search') {
                  const tokens = (search.ids[0] ?? '')
                    .split(',')
                    .map(s => s.trim())

                  setLocations(tokens)
                } else {
                  resetSearch()
                }
              }}
              className="w-80 text-xs font-medium"
            /> */}

            <LocationAutocomplete
              value={query}
              //showClear={false}
              onTextChange={v => {
                setQuery([v])
              }}
              onTextChanged={v => {
                const tokens = v.split(',').map(s => s.trim())

                setLocations(tokens)
              }}
              className="w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 text-xs"
            />
          </>

          <Select
            value={settings.genome}
            onValueChange={v => {
              const newOptions = produce(settings, draft => {
                draft.genome = v
              })

              updateSettings(newOptions)
            }}
          >
            <SelectTrigger
              variant="header"
              className="text-sm"
              title="Select Genome"
            >
              <SelectValue placeholder="Select a genome" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectGroup className="flex flex-col">
                <SelectLabel>Genome Assembly</SelectLabel>
                <SelectItem value="hg19" variant="theme">
                  hg19
                </SelectItem>
                <SelectItem value="grch38" variant="theme">
                  grch38
                </SelectItem>
                <SelectItem value="mm10" variant="theme">
                  mm10
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </HeaderPortal>

        <Toolbar tabs={tabs}>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel
            tabShortcutMenu={
              <ShowOptionsMenu
                onClick={() => {
                  setShowSideBar(!showSideBar)
                }}
              />
            }
          />
        </Toolbar>

        <TabSlideBar
          id="tracks"
          tabs={chartTabs}
          limits={[50, 85]}
          side="right"
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card
            variant="content"
            className="mx-2 mb-2 grow"
            //onMouseDown={handleMouseDown}
            style={{
              userSelect: isCtrlPressed ? 'none' : 'auto',
            }}
          >
            <div className="custom-scrollbar relative overflow-scroll grow data-[drag=true]:pointer-events-none">
              <TracksView
                genesMap={genesMap}
                //xax={xax}
                ref={svgRef}
                //dfs={plotFrames}
                className="absolute"
                style={{
                  pointerEvents: isCtrlPressed ? 'none' : 'auto',
                }}
              />

              {/* {tooltip.x !== -1 && (
                <div
                  className="fixed z-overlay z-(--z-overlay) pointer-events-none -translate-x-1/2"
                  style={{
                    top: tooltip.y,
                    left: tooltip.x,
                  }}
                >
                  <HCenterCol className="text-xs gap-y-1">
                    <span
                      className="border border-border shadow-md bg-white/90 p-1 w-14 text-center rounded-theme"
                      style={{ color: 'black' }}
                    >
                      {tooltip.realY.toFixed(2)}
                    </span>
                    <span
                      className="w-0 border-l border-black/90 border-dashed"
                      style={{ height: '5rem' }}
                    />
                  </HCenterCol>
                </div>
              )} */}

              {/* {isSelecting.current && dragPosition && (
                <>
                  <span
                    className="absolute h-full bg-theme/20 border border-theme border-dashed top-0 pointer-events-none"
                    style={{
                      left: Math.min(isSelecting.current.x, dragPosition.x),
                      width: Math.abs(dragPosition.x - isSelecting.current.x),
                    }}
                  />
                 
                </>
              )} */}
            </div>
          </Card>
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-between">
          <VCenterRow className="gap-x-1">
            <span>Bin size</span>

            <Select
              value={
                settings.seqs.bins.autoSize ? 'auto' : binSizes[0]!.toString()
              }
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.seqs.bins.autoSize = v === 'auto'

                  if (v !== 'auto') {
                    draft.seqs.bins.size = Number(v) as BinSize
                  }
                })

                updateSettings(newOptions)
              }}
            >
              <SelectPrimitive.Trigger asChild>
                <ToolbarFooterButton
                  size="sm"
                  className={cn('justify-center px-1')}
                  aria-label="Show zoom levels"
                  variant="theme-muted"
                >
                  {`${binSizes[0]!} bp`}{' '}
                  {settings.seqs.bins.autoSize ? `(auto)` : ''}
                </ToolbarFooterButton>
              </SelectPrimitive.Trigger>

              <SelectContent className="text-xs">
                <SelectGroup>
                  <SelectItem value="auto" key="auto">
                    Auto
                  </SelectItem>

                  <SelectItem value="16">16</SelectItem>
                  <SelectItem value="64">64</SelectItem>
                  <SelectItem value="256">256</SelectItem>
                  <SelectItem value="1024">
                    {(1024).toLocaleString()}
                  </SelectItem>
                  <SelectItem value="4096">
                    {(4096).toLocaleString()}
                  </SelectItem>
                  <SelectItem value="16384">
                    {(16384).toLocaleString()}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </VCenterRow>
          <></>
          <ZoomSlider />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SeqBrowserQueryPage() {
  return (
    <CoreProviders>
      {/* <SeqBrowserSettingsProvider> */}
      {/* <SearchProvider defaultSearch="chr3:187441954-187466041"> */}
      {/* <ZoomProvider> */}
      <TracksProvider>
        <SeqBrowserPage />
      </TracksProvider>
      {/* </ZoomProvider> */}
      {/* </SearchProvider> */}
      {/* </SeqBrowserSettingsProvider> */}
    </CoreProviders>
  )
}
