// 'use client'

import { ToolbarFooterPortal } from '@/toolbar/toolbar-footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'
import { ToolbarSeparator } from '@/toolbar/toolbar-separator'

import { SearchIcon } from '@/icons/search-icon'

import { useEffect, useRef, useState } from 'react'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import {
  NO_DIALOG,
  TEXT_CANCEL,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_SAVE_IMAGE,
  type IDialogParams,
} from '@/consts'
import { ChevronRightIcon } from '@/icons/chevron-right-icon'

import { GenLoc, parseGenLoc } from '@/lib/genomic/genomic'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectList,
  SelectTrigger,
} from '@/themed/v2/select'
import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { SaveImageDialog } from '@/components/pages/save-image-dialog'
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { FileImageIcon } from '@/icons/file-image-icon'
import { randId } from '@/lib/id'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import MODULE_INFO from './module.json'

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
import { Card } from '@/themed/card'

import { useSettingsTabs } from '@/components/dialog/settings/setting-tabs-store'
import { HeaderPortal } from '@/components/header/header-portal'
import { ModuleInfoButton } from '@/components/header/module-info-button'
import { DownloadImageIcon } from '@/components/icons/download-image-icon'
import type { ISaveAsResponse } from '@/components/pages/save-as-dialog'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { useSearch } from '@/hooks/search'
import { useStableId } from '@/hooks/stable-id'
import { ExportIcon } from '@/icons/export-icon'
import { CoreProviders } from '@/providers/core-providers'
import { GroupToggle, ToggleGroup } from '@/themed/v2/toggle-group'
import { produce } from 'immer'

import { ToolbarDropdownButton } from '@/components/toolbar/toolbar-dropdown-button'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { ListChevronsUpDownIcon } from 'lucide-react'
import {
  OPTS_SIDEBAR_ID,
  ShowOptsSidebarBtn,
} from '../../matcalc/data/data-panel'
import { LocationAutocomplete } from './location-autocomplete'
import { LocationsPropsPanel } from './locations/locations-props-panel'
import {
  useSeqBrowserSettings,
  type BinSize,
  type GeneView,
} from './seq-browser-settings'
import { SettingsPlotPanel } from './settings/settings-plot-panel'
import { SettingsTracksPanel } from './settings/settings-tracks-panel'
import { TracksView } from './svg/tracks-view'
import { useTracks } from './tracks-store'

const PLOT_ZOOM_CHANNEL = 'seq-browser-zoom'

function SeqBrowserPage() {
  const _id = useStableId('seq-browser-page')
  const { locations, binSizes, setLocations, dispatch } = useTracks()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()
  const { settings, updateSettings } = useSeqBrowserSettings()

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL) //Ctx()

  const { setSettingsTabs, setDefaultSettingsTab } = useSettingsTabs()

  const { query, setQuery } = useSearch()

  const svgRef = useRef<SVGSVGElement>(null)

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const [showSideBar, setShowSideBar] = useState(true)

  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  function setLocationZoom(scale: number) {
    setLocations(
      locations.map(location => {
        const w = Math.round(
          Math.max(100, (location.end - location.start + 1) * scale)
        )

        const s = Math.round((location.start + location.end) / 2 - w / 2)

        return new GenLoc(location.chr, s, s + w)
      })
    )
  }

  useKeyDownListener(e => {
    if ((e as KeyboardEvent).ctrlKey) {
      setIsCtrlPressed(true) // Ctrl key is pressed
    }
  })

  useKeyUpListener(() => {
    setIsCtrlPressed(false)
  })

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

  useEffect(
    () =>
      updateSettings(
        produce(settings, draft => {
          draft.zoom = zoom
        })
      ),
    [zoom]
  )

  useEffect(() => {
    // When the genome changes, reset tracks and locations
    dispatch({ type: 'reset' })
  }, [settings.assembly])

  // when the user changes the locations, update the query
  // to match. Essentially syncing the two. The search box
  // shows the first location being viewed.
  useEffect(() => {
    setQuery(
      locations.map(location => {
        return location.loc
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

  const tabs: ITab[] = [
    {
      //id: nanoid(),
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarIconButton
              title={TEXT_SAVE_IMAGE}
              onClick={() =>
                setShowDialog({
                  id: randId('save'),
                })
              }
            >
              <DownloadImageIcon />
            </ToolbarIconButton>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="View" className="gap-x-0.5">
            {/* <VCenterRow className="group-data-[ribbon=classic]:hidden">
              <ToolbarOptionalDropdownButton
                pad="none"
                icon={<ZoomInIcon />}
                onMainClick={() => {
                  setLocationZoom(0.5)
                }}
                title="Zoom In"
              >
                <DropdownMenuItem
                  aria-label="Zoom In"
                  onClick={() => {
                    setLocationZoom(0.5)
                  }}
                >
                  <ZoomInIcon stroke="" />
                  <span>Zoom In</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  aria-label="Zoom Out"
                  onClick={() => {
                    setLocationZoom(2)
                  }}
                >
                  <ZoomOutIcon stroke="" />
                  <span>Zoom Out</span>
                </DropdownMenuItem>
              </ToolbarOptionalDropdownButton>
            </VCenterRow> */}
            <ToolbarCol>
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
            </ToolbarCol>

            <ToolbarCol>
              <ToolbarIconButton
                title="Move Left"
                onClick={() => {
                  setLocations(
                    locations.map(location => {
                      const w = location.end - location.start + 1
                      const s =
                        location.start -
                        Math.pow(
                          10,
                          Math.max(2, Math.floor(Math.log10(w)) - 1)
                        ) *
                          2

                      return new GenLoc(location.chr, s, s + w)
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
                        Math.pow(
                          10,
                          Math.max(2, Math.floor(Math.log10(w)) - 1)
                        ) *
                          2

                      return new GenLoc(location.chr, s, s + w)
                    })
                  )
                }}
              >
                <ChevronRightIcon />
              </ToolbarIconButton>
            </ToolbarCol>
          </ToolbarTabGroup>

          <ToolbarSeparator />

          <ToolbarTabGroup title="Display" className="gap-x-1 items-stretch">
            <ToolbarCol>
              {/* <SelectList
                w="sm"
                variant="toolbar"
                items={GENE_DISPLAY_OPTIONS}
                value={settings.genes.display}
                onValueChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.display = v as GeneDisplay
                    })
                  )
                }}
              >
                {GENE_DISPLAY_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectList> */}

              <ToolbarDropdownButton
                icon={<ListChevronsUpDownIcon size={18} strokeWidth={1.5} />}
                //icon={<span>Gene View</span>}
                title="Gene display mode"
                showArrow={false}
              >
                <DropdownMenuCheckboxItem
                  checked={settings.genes.display === 'dense'}
                  onClick={() => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.genes.display = 'dense'
                      })
                    )
                  }}
                >
                  Dense
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={settings.genes.display === 'pack'}
                  onClick={() => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.genes.display = 'pack'
                      })
                    )
                  }}
                >
                  Pack
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  checked={settings.genes.display === 'full'}
                  onClick={() => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.genes.display = 'full'
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
                  const newOptions = produce(settings, draft => {
                    draft.reverse = !draft.reverse
                  })

                  updateSettings(newOptions)
                }}
              >
                <ArrowLeftRightIcon />
              </ToolbarIconButton>
            </ToolbarCol>

            <ToggleGroup
              value={[settings.genes.view]}
              onValueChange={v => {
                if (v[0]) {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.view = v[0] as GeneView
                    })
                  )
                }
              }}
              size="toolbar"
              justify="start"
              direction="toolbar"
            >
              <GroupToggle key="transcript" value="transcript" className="px-2">
                Transcript
              </GroupToggle>

              <GroupToggle key="features" value="features" className="px-2">
                Features
              </GroupToggle>
            </ToggleGroup>

            <ToolbarSeparator />

            <ToggleGroup
              value={[
                settings.genes.canonical.only ? ['canonical'] : [],
                settings.genes.types === 'protein-coding'
                  ? ['protein-coding']
                  : [],
              ].flat()}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.genes.canonical.only = v.includes('canonical')

                  draft.genes.types = v.includes('protein-coding')
                    ? 'protein-coding'
                    : 'all'
                })

                updateSettings(newSettings)
              }}
              size="toolbar"
              justify="start"
              direction="toolbar"
              multiple={true}
            >
              <GroupToggle value="canonical">Canonical</GroupToggle>

              <GroupToggle value="protein-coding">Protein coding</GroupToggle>
            </ToggleGroup>
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
              downloadSvgAutoFormat(svgRef, (data as ISaveAsResponse).name)
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        />
      )}

      <ShortcutLayout signinRequired={false}>
        <HeaderPortal>
          <ModuleInfoButton info={MODULE_INFO} />

          <>
            <LocationAutocomplete
              value={query.toString()}
              //showClear={false}
              onTextChange={v => {
                setQuery([v])
              }}
              clear={() => {
                setQuery([])
              }}
              onTextChanged={v => {
                const tokens = v.split(',').map(s => s.trim())

                if (tokens.length === 0) {
                  return
                }

                // replace existing locations
                const newLocations: GenLoc[] = [...locations]

                // Top level only process updates the first location
                // To set other locations, the user must use the locations panel
                try {
                  newLocations[0] = parseGenLoc(tokens[0]!)
                } catch (e) {
                  console.warn('Failed to parse location ', tokens[0]!)
                }

                // for (const [i, token] of tokens.entries()) {
                //   try {
                //     if (i < locations.length) {
                //       newLocations[i] = parseLocation(token)
                //     } else {
                //       newLocations.push(parseLocation(token))
                //     }
                //   } catch (e) {
                //     console.warn('Failed to parse location ', token)
                //   }
                // }

                setLocations(newLocations)
              }}
              onLocationChanged={l => {
                //const newLocations: GenLoc[] = [...locations]

                ///newLocations[0] = toGenLoc(l)

                // only update the first location, user must use locations panel to set others
                setLocations([l, ...locations.slice(1)])
                // Only add location if not already present
                //const isIn = locations.some(loc => locStr(loc) === locStr(l))
                //if (!isIn) {
                //  setLocations([...locations, l])
                //}
              }}
              className="w-4/5 lg:w-3/5 xl:w-1/2 2xl:w-2/5 text-xs"
            />
          </>

          <SelectList
            variant="header"
            w="xs"
            className="text-xs"
            value={settings.assembly}
            onValueChange={v => {
              const newOptions = produce(settings, draft => {
                draft.assembly = (v as string) ?? 'hg19'
              })

              updateSettings(newOptions)
            }}
          >
            <SelectGroup>
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
          </SelectList>
        </HeaderPortal>

        <Toolbar>
          <ToolbarMenu
            groupId={_id}
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            fileMenuTabs={fileMenuTabs}
          />
          <ToolbarPanel
            groupId={_id}
            tabs={tabs}
            tabShortcutMenu={
              <ShowOptsSidebarBtn
                open={edbSettings.sidebar.show}
                onClick={open => {
                  updateEdbSettings(
                    produce(edbSettings, draft => {
                      draft.sidebar.show = open
                    })
                  )
                }}
              />
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
                //xax={xax}
                ref={svgRef}
                //dfs={plotFrames}
                className="absolute"
                style={{
                  pointerEvents: isCtrlPressed ? 'none' : 'auto',
                }}
              />
            </div>
          </Card>
        </TabSlideBar>

        <ToolbarFooterPortal className="justify-between">
          <VCenterRow className="gap-x-2 px-1">
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
              <SelectTrigger variant="footer" showIcon={false} w="auto">
                {settings.seqs.bins.autoSize
                  ? `Auto (${binSizes[0]!} bp)`
                  : `${binSizes[0]!} bp`}
              </SelectTrigger>

              <SelectContent className="text-xs">
                <SelectGroup>
                  <SelectItem value="auto" key="auto">
                    Auto
                  </SelectItem>

                  {/* <SelectItem value="16">16</SelectItem>
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
                  </SelectItem> */}

                  <SelectItem value="50">50 bp</SelectItem>
                  <SelectItem value="100">100 bp</SelectItem>
                  <SelectItem value="1000">1000 bp</SelectItem>
                  <SelectItem value="10000">
                    {(10000).toLocaleString()} bp
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </VCenterRow>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </ToolbarFooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SeqBrowserQueryPage() {
  return (
    <CoreProviders>
      {/* <TracksProvider> */}
      <SeqBrowserPage />
      {/* </TracksProvider> */}
    </CoreProviders>
  )
}
