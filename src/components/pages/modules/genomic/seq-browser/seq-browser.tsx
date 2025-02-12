'use client'

import { ToolbarFooter } from '@components/toolbar/toolbar-footer'
import { ToolbarOpenFile } from '@components/toolbar/toolbar-open-files'
import { ZoomSlider } from '@components/toolbar/zoom-slider'

import {
  ShowOptionsMenu,
  Toolbar,
  ToolbarMenu,
  ToolbarPanel,
} from '@components/toolbar/toolbar'
import { ToolbarIconButton } from '@components/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@components/toolbar/toolbar-separator'

import { SearchIcon } from '@icons/search-icon'

import { useContext, useEffect, useMemo, useRef, useState } from 'react'

import { ChevronRightIcon } from '@/components/icons/chevron-right-icon'
import { Axis } from '@/components/plot/axis'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { ToolbarOptionalDropdownButton } from '@/components/toolbar/toolbar-optional-dropdown-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { NO_DIALOG, TEXT_FILE, type IDialogParams } from '@/consts'
import { type IPos } from '@/interfaces/pos'
import { API_GENES_GENOMES_URL } from '@/lib/edb/edb'
import { GenomicLocation } from '@/lib/genomic/genomic'
import { SearchContext, SearchProvider } from '@/providers/search-provider'
import { FileImageIcon } from '@components/icons/file-image-icon'
import { SaveImageDialog } from '@components/pages/save-image-dialog'
import { SearchBox } from '@components/search-box'
import { DropdownMenuItem } from '@components/shadcn/ui/themed/dropdown-menu'
import { type ITab } from '@components/tab-provider'
import { downloadImageAutoFormat } from '@lib/image-utils'
import { makeRandId } from '@lib/utils'
import { CoreProviders } from '@providers/core-providers'
import { useQuery } from '@tanstack/react-query'
import MODULE_INFO from './module.json'

import { TracksPropsPanel } from './tracks-props-panel'
import { TracksContext, TracksProvider } from './tracks-provider'

import { CompassIcon } from '@/components/icons/compass-icon'
import { CubeIcon } from '@/components/icons/cube-icon'
import { LayersIcon } from '@/components/icons/layers-icon'

import { SettingsIcon } from '@/components/icons/settings-icon'
import { ZoomInIcon } from '@/components/icons/zoom-in-icon'
import { ZoomOutIcon } from '@/components/icons/zoom-out-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Card } from '@/components/shadcn/ui/themed/card'
import { ToolbarFooterButton } from '@/components/toolbar/toolbar-footer-button'
import { useKeyDownListener } from '@/hooks/use-keydown-listener'
import { useKeyUpListener } from '@/hooks/use-keyup-listener'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { cn } from '@/lib/class-names'
import { httpFetch } from '@/lib/http/http-fetch'
import * as SelectPrimitive from '@radix-ui/react-select'
import { produce } from 'immer'
import { Save } from 'lucide-react'
import type { IGeneDbInfo } from '../annotate/annotate'
import { LocationsPropsPanel } from './locations/locations-props-panel'
import {
  SeqBrowserSettingsContext,
  SeqBrowserSettingsProvider,
  type BinSize,
} from './seq-browser-settings-provider'
import { SettingsPlotPanel } from './settings/settings-plot-panel'
import { SettingsTracksPanel } from './settings/settings-tracks-panel'
import { TracksSvg, type GenesMap } from './svg/tracks-svg'

export function SeqBrowserPage() {
  //const [fileStore, filesDispatch] = useReducer(filesReducer, { files: [] })
  //const [fileData, setFileData] = useState<{ [key: string]: string[] }>({})

  const { locations, binSizes, setLocations, tooltip } =
    useContext(TracksContext)
  const { settings, updateSettings } = useContext(SeqBrowserSettingsContext)

  // useEffect(() => {
  //   if (apiKey !== '') {
  //     //save key to settings for ease of use
  //     updateSettings({ apiKey })
  //   }
  // }, [apiKey])

  //useMouseUpListener(handleMouseUp)

  const { search, setSearch } = useContext(SearchContext)

  const canvasRef = useRef(null)
  const downloadRef = useRef<HTMLAnchorElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  //const [binWidth, setBinWidth] = useState(1000)
  const [showFileMenu, setShowFileMenu] = useState(false)
  const [scale, setScale] = useState(1)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showSideBar, setShowSideBar] = useState(true)

  //console.log('bin size', binSize)

  const isSelecting = useRef<IPos | null>(null)
  //const [isShiftPressed, setIsShiftPressed] = useState(false)
  const [isCtrlPressed, setIsCtrlPressed] = useState(false)
  //const isChangingLocViaDrag = useRef<IPos | null>(null)

  //const currentMousePosition = useRef<IPos | null>(null)
  const dragStartPosition = useRef<IPos | null>(null)
  const [dragPosition, setDragPosition] = useState<IPos | null>(null)
  const currentLocation = useRef<GenomicLocation | null>(null)

  function zoom(scale: number) {
    setLocations(
      locations.map((location) => {
        const w = Math.round(
          Math.max(100, (location.end - location.start + 1) * scale)
        )
        const s = Math.round((location.start + location.end) / 2 - w / 2)

        return new GenomicLocation(location.chr, s, s + w)
      })
    )
  }

  useKeyDownListener((e) => {
    if (e.ctrlKey) {
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

  // const xax = useMemo(
  //   () =>
  //     new Axis()
  //       .setDomain([location.start, location.end])
  //       .setLength(settings.width)
  //       .setTicks([location.start, location.end]),
  //   //.setTickLabels(range(1, n + 1))
  //   [location, settings]
  // )

  const xax = useMemo(
    () =>
      new Axis()
        .setDomain([locations[0]!.start, locations[0]!.end])
        .setLength(settings.plot.width)
        .setTicks([locations[0]!.start, locations[0]!.end]),
    [locations]
  )

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [xax])

  function handleMouseDown(e: React.MouseEvent) {
    const { clientX, currentTarget } = e
    const x = clientX - currentTarget.getBoundingClientRect().left

    //setPosition({ x, y: 0 })

    if (e.ctrlKey) {
      isSelecting.current = { x, y: 0 }
      //setCtrlKeyIsPressed(true)
    }

    //if (e.shiftKey) {
    //  isChangingLocViaDrag.current = { x, y: 0 }
    //}

    dragStartPosition.current = { x, y: 0 }
    currentLocation.current = locations[0]!

    window.addEventListener('mousemove', handleMouseMove)
    //window.addEventListener('mouseup', handleMouseUp)
  }

  function handleMouseUp(e: MouseEvent) {
    if (isSelecting.current) {
      const { clientX, target } = e
      const x = clientX - (target as HTMLElement).getBoundingClientRect().left

      const start = isSelecting.current.x - settings.margin.left
      const end = x - settings.margin.left

      const rangeX1 = xax.rangeToDomain(start)
      const rangeX2 = xax.rangeToDomain(end)

      // user must select a region of at least 1kb before selection system
      // works, otherwise too sensitive
      if (Math.abs(rangeX1 - rangeX2) > 1000) {
        setLocations([new GenomicLocation(locations[0]!.chr, rangeX1, rangeX2)])
      }
    }

    //setPosition(null)
    isSelecting.current = null
    //currentMousePosition.current = null
    //isChangingLocViaDrag.current = null
    currentLocation.current = null
    dragStartPosition.current = null
    //setCtrlKeyIsPressed(false)

    window.removeEventListener('mousemove', handleMouseMove)
    //window.removeEventListener('mouseup', handleMouseUp)
  }

  function handleMouseMove(e: MouseEvent) {
    // only update when mouse down
    if (dragStartPosition.current) {
      const { clientX, target } = e
      const x = clientX - (target as HTMLElement).getBoundingClientRect().left

      //currentMousePosition.current = { x, y: 0 }

      if (isSelecting.current) {
        setDragPosition({ x, y: 0 })
      }

      // else if (isChangingLocViaDrag.current) {
      //   const f = (xax.domain[1] - xax.domain[0] + 1) / xax.length

      //   const pixToBp = (e.clientX - dragStartPosition.current!.x) * f

      //   setLocation(
      //     new GenomicLocation(
      //       currentLocation.current!.chr,
      //       currentLocation.current!.start - pixToBp,
      //       currentLocation.current!.end - pixToBp
      //     )
      //   )
      // } else {
      //   // do nothing
      // }
    }
  }

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

  function adjustScale(scale: number) {
    setScale(scale)
    updateSettings({ ...settings, zoom: scale })
  }

  // const tracksQuery = useQuery({
  //   queryKey: ['tracks'],
  //   queryFn: async () => {
  //     const accessToken = await getAccessTokenAutoRefresh()

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
    setSearch(locations.map((l) => l.loc)[0]!) //.join(','))
  }, [locations])

  const genomesQuery = useQuery({
    queryKey: ['genomes'],
    queryFn: async () => {
      //const token = await loadAccessToken()

      const res = await httpFetch.getJson<{ data: IGeneDbInfo[] }>(
        API_GENES_GENOMES_URL
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
      id: 'Export',
      content: (
        <>
          <DropdownMenuItem
            aria-label="Download as PNG"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `tracks.png`
              )
            }}
          >
            <FileImageIcon stroke="" />
            <span>Download as PNG</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label=" Download as CSV"
            onClick={() => {
              downloadImageAutoFormat(
                svgRef,
                canvasRef,
                downloadRef,
                `tracks.svg`
              )
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
              onOpenChange={(open) => {
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
              title="Save image"
              onClick={() =>
                setShowDialog({
                  id: makeRandId('save'),
                })
              }
            >
              <Save className="rotate-180 w-5 h-5" strokeWidth={1.5} />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Zoom">
            <ToolbarOptionalDropdownButton
              icon={<ZoomInIcon />}
              onMainClick={() => {
                zoom(0.5)
              }}
              title="Zoom in 2x"
            >
              <DropdownMenuItem
                aria-label="Zoom in 2x"
                onClick={() => {
                  zoom(0.5)
                }}
              >
                Zoom in 2x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom in 3x"
                onClick={() => {
                  zoom(1 / 3)
                }}
              >
                Zoom in 3x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom in 4x"
                onClick={() => {
                  zoom(0.25)
                }}
              >
                Zoom in 4x
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>

            <ToolbarOptionalDropdownButton
              icon={<ZoomOutIcon />}
              onMainClick={() => {
                zoom(2)
              }}
              title="Zoom out 2x"
            >
              <DropdownMenuItem
                aria-label="Zoom out 2x"
                onClick={() => {
                  zoom(2)
                }}
              >
                Zoom out 2x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom out 3x"
                onClick={() => {
                  zoom(3)
                }}
              >
                Zoom out 3x
              </DropdownMenuItem>
              <DropdownMenuItem
                aria-label="Zoom out 4x"
                onClick={() => {
                  zoom(4)
                }}
              >
                Zoom out 4x
              </DropdownMenuItem>
            </ToolbarOptionalDropdownButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="move">
            <ToolbarIconButton
              title="Move left"
              onClick={() => {
                setLocations(
                  locations.map((location) => {
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
              title="Move right"
              onClick={() => {
                setLocations(
                  locations.map((location) => {
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
        </>
      ),
    },
  ]

  const chartTabs: ITab[] = [
    {
      id: 'Tracks',
      icon: <SearchIcon />,
      content: <TracksPropsPanel downloadRef={downloadRef} />,
    },
    {
      id: 'Locations',
      icon: <SettingsIcon />,
      content: <LocationsPropsPanel downloadRef={downloadRef} />,
    },
    // {
    //   id: TEXT_ACCOUNT,
    //   icon: <SlidersIcon />,
    //   content: <AccountPropsPanel />,
    // },
  ]

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

  return (
    <>
      {showDialog.id.includes('save') && (
        <SaveImageDialog
          open="open"
          onSave={(format) => {
            downloadImageAutoFormat(
              svgRef,
              canvasRef,
              downloadRef,
              `tracks.${format.ext}`
            )
            setShowDialog({ ...NO_DIALOG })
          }}
          onCancel={() => setShowDialog({ ...NO_DIALOG })}
        />
      )}

      <ShortcutLayout
        info={MODULE_INFO}
        settingsTabs={settingsTabs}
        defaultSettingsTab={MODULE_INFO.name}
        headerCenterChildren={
          <SearchBox
            variant="header"
            h="header"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onSearch={async (event) => {
              if (event === 'search') {
                const tokens = search.split(',').map((s) => s.trim())

                setLocations(tokens)
              } else {
                setSearch('')
              }
            }}
            className="w-96 text-xs font-medium"
          />
        }
        headerRightChildren={
          <>
            <Select
              value={settings.genome}
              onValueChange={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.genome = v
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger
                variant="header"
                className="text-sm"
                title="Select genome"
              >
                <SelectValue placeholder="Select a genome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hg19">hg19</SelectItem>
                <SelectItem value="grch38">grch38</SelectItem>
                <SelectItem value="mm10">mm10</SelectItem>
              </SelectContent>
            </Select>
          </>
        }
        //apiKey={settings.apiKey}
        //signInMode="api"
        showSignInError={false}
      >
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
          tabs={chartTabs}
          side="Right"
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <Card
            variant="content"
            className="mx-2 mb-2 grow"
            onMouseDown={handleMouseDown}
            style={{
              userSelect: isCtrlPressed ? 'none' : 'auto',
            }}
          >
            <div className="custom-scrollbar relative overflow-scroll grow data-[drag=true]:pointer-events-none">
              <TracksSvg
                genesMap={genesMap}
                //xax={xax}
                ref={svgRef}
                //dfs={plotFrames}
                className="absolute"
                style={{
                  pointerEvents: isCtrlPressed ? 'none' : 'auto',
                }}
              />

              {tooltip.x !== -1 && (
                <div
                  className="fixed z-overlay z-(--z-overlay) pointer-events-none -translate-x-1/2"
                  style={{
                    top: tooltip.y,
                    left: tooltip.x,
                  }}
                >
                  {tooltip.content}
                </div>
              )}

              {isSelecting.current && dragPosition && (
                <>
                  <span
                    className="absolute h-full bg-theme/20 border border-theme border-dashed top-0 pointer-events-none"
                    style={{
                      left: Math.min(isSelecting.current.x, dragPosition.x),
                      width: Math.abs(dragPosition.x - isSelecting.current.x),
                    }}
                  ></span>
                  {/* <span
                      className="absolute w-px h-full bg-theme top-0"
                      style={{ left: position.x }}
                    /> */}
                </>
              )}
            </div>
          </Card>
        </TabSlideBar>

        <ToolbarFooter className="justify-between">
          <VCenterRow className="gap-x-1">
            <span>Bin size:</span>

            <Select
              value={
                settings.seqs.bins.autoSize ? 'auto' : binSizes[0]!.toString()
              }
              onValueChange={(v) => {
                const newOptions = produce(settings, (draft) => {
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
                  className={cn('justify-center px-1')}
                  aria-label="Show zoom levels"
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
          <ZoomSlider scale={scale} onZoomChange={adjustScale} />
        </ToolbarFooter>

        <a ref={downloadRef} className="hidden" href="#" />

        <canvas ref={canvasRef} width={0} height={0} className="hidden" />
      </ShortcutLayout>
    </>
  )
}

export function SeqBrowserQueryPage() {
  return (
    <CoreProviders>
      <SeqBrowserSettingsProvider>
        <SearchProvider defaultSearch="chr3:187441954-187466041">
          <TracksProvider>
            <SeqBrowserPage />
          </TracksProvider>
        </SearchProvider>
      </SeqBrowserSettingsProvider>
    </CoreProviders>
  )
}
