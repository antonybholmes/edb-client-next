'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import {
  Toolbar,
  TOOLBAR_TABS,
  ToolbarMenu,
  ToolbarPanel,
} from '@/toolbar/toolbar'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { SearchIcon } from '@/icons/search-icon'

import { useEffect, useMemo, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import {
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_SAVE_IMAGE,
} from '@/consts'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectList,
  SelectTrigger,
} from '@/themed/v2/select'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { FileImageIcon } from '@/icons/file-image-icon'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import APP_INFO from './manifest.json'

import { TracksPropsPanel } from './tracks-props-panel'

import { CompassIcon } from '@/icons/compass-icon'
import { CubeIcon } from '@/icons/cube-icon'
import { LayersIcon } from '@/icons/layers-icon'

import { useKeyDownListener } from '@/hooks/keydown-listener'
import { useKeyUpListener } from '@/hooks/keyup-listener'
import { ArrowLeftRightIcon } from '@/icons/arrow-left-right-icon'
import { SettingsIcon } from '@/icons/settings-icon'
import { ZoomInIcon } from '@/icons/zoom-in-icon'
import { ZoomOutIcon } from '@/icons/zoom-out-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { useZoom } from '@/providers/zoom-provider'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { useSettingsTabs } from '@/dialogs/settings/setting-tabs-store'
import { useSearch } from '@/hooks/search'
import { useStableId } from '@/hooks/stable-id'
import { ExportIcon } from '@/icons/export-icon'
import { CoreProviders } from '@/providers/core-providers'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import { produce } from 'immer'

import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarDropdownButton } from '@/components/toolbar/toolbar-dropdown-button'
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { ListChevronsUpDownIcon } from 'lucide-react'
import { useDialogs } from '../../../../dialogs/dialogs'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'

import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { OPTS_SIDEBAR_ID } from '@/components/slide-bar/resizable-sidebar'
import { useTabs } from '@/components/tabs/tab-store'
import { AssemblySelect } from '@/lib/edb/assembly-select'
import { locStr } from '@/lib/genomic/genomic'
import {
  newGenomicLocation,
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { LocationAutocomplete } from './location-autocomplete'
import { LocationsPropsPanel } from './locations/locations-props-panel'
import { SeqbrowserDialogsRoot } from './seq-browser-dialogs'
import {
  useSeqBrowserSettings,
  type BinSize,
  type GeneView,
  type ReadScaleMode,
} from './seq-browser-settings'
import { SettingsPlotPanel } from './settings/settings-plot-panel'
import { SettingsTracksPanel } from './settings/settings-tracks-panel'
import { TracksView } from './svg/tracks-view'
import { useTracks } from './tracks-store'

const PLOT_ZOOM_CHANNEL = 'seq-browser-zoom'

function SeqBrowserPage() {
  const _id = useStableId('seq-browser-page')
  const { locations, binSizes, setLocations, dispatch } = useTracks()
  const { settings: edbSettings } = useEdbSettings()
  const { setAppInfo } = useAppInfo()
  const { settings, updateSettings } = useSeqBrowserSettings()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  const { setTabs: setToolbarTabs } = useTabs(TOOLBAR_TABS)

  const { query, setQuery } = useSearch()

  const svgRef = useRef<SVGSVGElement>(null)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { open: openDialog } = useDialogs()

  const [showSideBar, setShowSideBar] = useState(true)

  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  function setLocationZoom(scale: number) {
    setLocations(
      locations.map((location) => {
        const w = Math.round(
          Math.max(100, (location.end - location.start + 1) * scale)
        )

        const s = Math.round((location.start + location.end) / 2 - w / 2)

        return newGenomicLocation(location.chr, s, s + w)
      })
    )
  }

  useKeyDownListener((e) => {
    if ((e as KeyboardEvent).ctrlKey) {
      setIsCtrlPressed(true)
    }
  })

  useKeyUpListener(() => {
    setIsCtrlPressed(false)
  })

  useEffect(() => {
    setAppInfo(APP_INFO)
    const settingsTabs: ITab[] = [
      {
        id: APP_INFO.name,
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
    setDefaultSettingsTab(APP_INFO.name)

    const tabs: ITab[] = [
      {
        //id: nanoid(),
        id: 'Home',
        content: (
          <>
            <ToolbarTabGroup title={TEXT_FILE}>
              <ToolbarIconButton
                title={TEXT_SAVE_IMAGE}
                onClick={() => {
                  openDialog({
                    type: 'save-image',
                    payload: { svgRef, name: 'tracks' },
                  })
                }}
              >
                <DownloadIcon />
              </ToolbarIconButton>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="View" className="gap-x-0.5">
              <ToolbarCol>
                <VCenterRow>
                  <ToolbarIconButton
                    title="Zoom In"
                    onClick={() => setLocationZoom(0.5)}
                  >
                    <ZoomInIcon />
                  </ToolbarIconButton>

                  <ToolbarIconButton
                    title="Zoom Out"
                    onClick={() => setLocationZoom(2)}
                  >
                    <ZoomOutIcon />
                  </ToolbarIconButton>
                </VCenterRow>

                <VCenterRow>
                  <ToolbarIconButton
                    title="Move Left"
                    onClick={() => {
                      setLocations(
                        locations.map((location) => {
                          const w = location.end - location.start + 1
                          const s =
                            location.start -
                            Math.pow(
                              10,
                              Math.max(2, Math.floor(Math.log10(w)) - 1)
                            ) *
                              2

                          return newGenomicLocation(location.chr, s, s + w)
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
                        locations.map((location) => {
                          const w = location.end - location.start + 1
                          const s =
                            location.start +
                            Math.pow(
                              10,
                              Math.max(2, Math.floor(Math.log10(w)) - 1)
                            ) *
                              2

                          return newGenomicLocation(location.chr, s, s + w)
                        })
                      )
                    }}
                  >
                    <ChevronRightIcon />
                  </ToolbarIconButton>
                </VCenterRow>
              </ToolbarCol>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="Display" className="gap-x-1 items-stretch">
              <ToggleGroup
                value={[settings.tracks.genes.view]}
                onValueChange={(v) => {
                  if (v[0]) {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.tracks.genes.view = v[0] as GeneView
                      })
                    )
                  }
                }}
                size="toolbar"
                justify="start"
                direction="toolbar"
              >
                <GroupToggle
                  key="transcript"
                  value="transcript"
                  className="px-2"
                >
                  Transcript
                </GroupToggle>

                <GroupToggle key="features" value="features" className="px-2">
                  Features
                </GroupToggle>
              </ToggleGroup>

              <ToolbarCol>
                <ToolbarDropdownButton
                  icon={<ListChevronsUpDownIcon size={18} strokeWidth={1.5} />}
                  //icon={<span>Gene View</span>}
                  title="Gene display mode"
                  showArrow={false}
                >
                  <DropdownMenuCheckboxItem
                    checked={settings.tracks.genes.display === 'dense'}
                    onClick={() => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.display = 'dense'
                        })
                      )
                    }}
                  >
                    Dense
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={settings.tracks.genes.display === 'pack'}
                    onClick={() => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.display = 'pack'
                        })
                      )
                    }}
                  >
                    Pack
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuCheckboxItem
                    checked={settings.tracks.genes.display === 'full'}
                    onClick={() => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.display = 'full'
                        })
                      )
                    }}
                  >
                    Full
                  </DropdownMenuCheckboxItem>
                </ToolbarDropdownButton>

                <ToolbarIconButton
                  title="Reverse"
                  checked={settings.reverse}
                  onClick={() => {
                    const newOptions = produce(settings, (draft) => {
                      draft.reverse = !draft.reverse
                    })

                    updateSettings(newOptions)
                  }}
                >
                  <ArrowLeftRightIcon />
                </ToolbarIconButton>
              </ToolbarCol>

              <ToggleGroup
                value={[
                  settings.tracks.genes.canonical.only ? ['canonical'] : [],
                  settings.tracks.genes.types === 'protein-coding'
                    ? ['protein-coding']
                    : [],
                ].flat()}
                onValueChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.canonical.only = v.includes('canonical')

                    draft.tracks.genes.types = v.includes('protein-coding')
                      ? 'protein-coding'
                      : 'all'
                  })

                  updateSettings(newSettings)
                }}
                size="toolbar"
                //justify="start"
                direction="toolbar"
                multiple={true}
              >
                <GroupToggle value="canonical">Canonical</GroupToggle>

                <GroupToggle value="protein-coding">Protein coding</GroupToggle>
              </ToggleGroup>
            </ToolbarTabGroup>

            <ToolbarTabGroup title="Scale">
              <SelectList
                variant="toolbar"
                w="xs"
                value={settings.tracks.seqs.scale.mode}
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.tracks.seqs.scale.mode = v as ReadScaleMode
                    })
                  )
                }}
              >
                <SelectItem value="Count">Count</SelectItem>
                <SelectItem value="BPM">BPM</SelectItem>
                <SelectItem value="CPM">CPM</SelectItem>
              </SelectList>
            </ToolbarTabGroup>
          </>
        ),
      },
    ]

    setToolbarTabs(tabs)

    setQuery(['chr3:187441954-187466041'])
  }, [])

  useEffect(
    () =>
      updateSettings(
        produce(settings, (draft) => {
          draft.zoom = zoom
        })
      ),
    [zoom]
  )

  useEffect(() => {
    // When the genome changes, reset tracks and locations
    dispatch({ type: 'reset' })
  }, [edbSettings.genomic.assembly])

  // when the user changes the locations, update the query
  // to match. Essentially syncing the two. The search box
  // shows the first location being viewed.
  useEffect(() => {
    setQuery(
      locations.map((location) => {
        return locStr(location)
      })
    )
  }, [locations])

  // get the available GTF annotations available
  // const gtfQuery = useQuery({
  //   queryKey: ['genomes'],
  //   queryFn: async () => {
  //     //const token = await loadAccessToken()

  //     const res = await httpFetch.getJson<{ data: IGenomeAnnotation[] }>(
  //       API_GENOME_GTFS_URL
  //     )

  //     return res.data
  //   },
  // })

  // const gtfMap: GtfInfoMap = useMemo(
  //   () =>
  //     Object.fromEntries(
  //       gtfQuery.data
  //         ? gtfQuery.data.map(
  //             (g: IGenomeAnnotation) =>
  //               [g.assembly, g] as [string, IGenomeAnnotation]
  //           )
  //         : []
  //     ),
  //   [gtfQuery.data]
  // )

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      content: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `tracks.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, `tracks.svg`)
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  const chartTabs: ITab[] = useMemo(
    () => [
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
    ],
    []
  )

  return (
    <>
      <SeqbrowserDialogsRoot />

      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <>
            <AppHeaderIcon />
            <AppInfoButton />
          </>
          <>
            <LocationAutocomplete
              value={query.toString()}
              //showClear={false}
              onTextChange={(v) => {
                setQuery([v])
              }}
              clear={() => {
                setQuery([])
              }}
              onTextChanged={(v) => {
                const tokens = v.split(',').map((s) => s.trim())

                if (tokens.length === 0) {
                  return
                }

                // replace existing locations
                const newLocations: IGenomicLocation[] = [...locations]

                // Top level only process updates the first location
                // To set other locations, the user must use the locations panel
                try {
                  newLocations[0] = parseGenomicLocation(tokens[0]!)
                } catch (e) {
                  console.warn('Failed to parse location ', tokens[0]!)
                }

                setLocations(newLocations)
              }}
              onLocationChanged={(l) => {
                // only update the first location, user must use locations panel to set others
                setLocations([l, ...locations.slice(1)])
              }}
              className="w-4/5 lg:w-3/5   text-xs"
            />
          </>

          <AssemblySelect />
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar
          id={OPTS_SIDEBAR_ID}
          tabs={chartTabs}
          limits={[50, 85]}
          side="right"
          open={showSideBar}
          onOpenChange={setShowSideBar}
        >
          <ExtScrollCard
            variant="content"
            className="mx-2 mb-2"
            style={{
              userSelect: isCtrlPressed ? 'none' : 'auto',
            }}
          >
            <TracksView
              ref={svgRef}
              style={{
                pointerEvents: isCtrlPressed ? 'none' : 'auto',
              }}
            />
          </ExtScrollCard>
        </TabSlideBar>

        <FooterPortal className="justify-between">
          <VCenterRow className="gap-x-2 px-1 h-7">
            <span>Bin size</span>

            <Select
              value={
                settings.tracks.seqs.bins.autoSize
                  ? 'auto'
                  : binSizes[0]!.toString()
              }
              onValueChange={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.seqs.bins.autoSize = v === 'auto'

                  if (v !== 'auto') {
                    draft.tracks.seqs.bins.size = Number(v) as BinSize
                  }
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger
                variant="footer"
                showIcon={false}
                w="auto"
                h="full"
                className="px-1"
              >
                {settings.tracks.seqs.bins.autoSize
                  ? `Auto (${binSizes[0]!} bp)`
                  : `${binSizes[0]!} bp`}
              </SelectTrigger>

              <SelectContent className="text-xs">
                <SelectItem value="auto" key="auto">
                  Auto
                </SelectItem>

                <SelectItem value="50">50 bp</SelectItem>
                <SelectItem value="100">100 bp</SelectItem>
                <SelectItem value="1000">1000 bp</SelectItem>
                <SelectItem value="10000">
                  {(10000).toLocaleString()} bp
                </SelectItem>
              </SelectContent>
            </Select>
          </VCenterRow>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SeqBrowserQueryPage() {
  return (
    <CoreProviders>
      {/* <HistoryProvider app={APP_INFO.name}> */}
      <SeqBrowserPage />
      {/* </HistoryProvider> */}
      {/* </TracksProvider> */}
    </CoreProviders>
  )
}
