'use client'

import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ZoomSlider } from '@/toolbar/zoom-slider'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import { useEffect, useState } from 'react'

import {
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
} from '@/consts'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/themed/v2/select'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { type ITab } from '@/components/tabs/tab-provider'
import { FileImageIcon } from '@/icons/file-image-icon'
import APP_INFO from './manifest.json'

import { CompassIcon } from '@/icons/compass-icon'
import { LayersIcon } from '@/icons/layers-icon'

import { useKeyDownListener } from '@/hooks/keydown-listener'
import { useKeyUpListener } from '@/hooks/keyup-listener'
import { VCenterRow } from '@/layout/v-center-row'
import { ShortcutLayout } from '@/layouts/shortcut-layout'
import { useZoom } from '@/providers/zoom-provider'

import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { useSettingsTabs } from '@/dialogs/settings/setting-tabs-store'
import { useSearch } from '@/hooks/search'
import { ExportIcon } from '@/icons/export-icon'
import { CoreProviders } from '@/providers/core-providers'
import { produce } from 'immer'

import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'

import { AssemblySelect } from '@/components/edb/assembly-select'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useUpdateEffect } from '@/hooks/update-effect'
import { locStr } from '@/lib/genomic/genomic'
import {
  parseGenomicLocation,
  type IGenomicLocation,
} from '@/lib/genomic/genomic-location'
import { useSVG } from '@/providers/svg-provider'
import { Box } from 'lucide-react'
import { LocationAutocomplete } from './location-autocomplete'
import { SeqbrowserDialogsRoot } from './seq-browser-dialogs'
import { SeqBrowserPropsPanel } from './seq-browser-props-panel'
import { useSeqBrowserSettings, type BinSize } from './seq-browser-settings'
import { SettingsCytobandPanel } from './settings/settings-cytoband-panel'
import { SettingsPlotPanel } from './settings/settings-plot-panel'
import { SettingsTracksPanel } from './settings/settings-tracks-panel'
import { TracksView } from './svg/tracks-view'
import { HomeToolbar } from './toolbars/home-toolbar'
import { useTracks } from './tracks-store'

function SeqBrowserPage() {
  const { locations, binSizes, setLocations, dispatch } = useTracks()
  const { settings: edbSettings } = useEdbSettings()
  const { setAppInfo } = useAppInfo()
  const { settings, updateSettings } = useSeqBrowserSettings()

  useZoom({
    onChange: ({ zoom }) => {
      updateSettings(
        produce(settings, (draft) => {
          draft.scale = zoom
        })
      )
    },
  })

  const { setSettingsTabs, setDefaultTab: setDefaultSettingsTab } =
    useSettingsTabs()

  const { setTabs: setToolbarTabs } = useToolbarTabs()

  const { query, setQuery, resetQuery } = useSearch()

  const [showFileMenu, setShowFileMenu] = useState(false)

  const [isCtrlPressed, setIsCtrlPressed] = useState(false)

  const { autoSave } = useSVG()

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
  }, [setAppInfo])

  useEffect(() => {
    setSettingsTabs([
      {
        id: '01a03f83-1204-7632-afdf-6eb4877a5efc',
        name: APP_INFO.name,
        icon: <Box strokeWidth={1.5} size={18} />,

        children: [
          {
            id: 'Plot',
            icon: <CompassIcon />,
            component: SettingsPlotPanel,
          },
          {
            id: 'Tracks',
            icon: <LayersIcon />,
            component: SettingsTracksPanel,
          },
          {
            id: 'Cytobands',
            icon: <LayersIcon />,
            component: SettingsCytobandPanel,
          },
        ],
      },
    ])
  }, [setSettingsTabs, setDefaultSettingsTab])

  useEffect(() => {
    setToolbarTabs([
      {
        id: 'Home',
        component: HomeToolbar,
      },
    ])
  }, [setToolbarTabs])

  // useEffect(() => {
  //   setSideTabs([
  //     {
  //       id: 'Tracks',
  //       component: TracksPropsPanel,
  //     },
  //     {
  //       id: 'Locations',
  //       component: LocationsPropsPanel,
  //     },
  //   ])
  // }, [setSideTabs])

  useUpdateEffect(() => {
    // set initial location
    setQuery(['chr3:187441954-187466041'])
  }, [setQuery])

  // useHydratedUpdateEffect(
  //   () => {
  //     updateSettings(
  //       produce(settings, (draft) => {
  //         draft.scale = zoom
  //       })
  //     )
  //   },
  //   [zoom],
  //   hasHydrated
  // )

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
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              autoSave(`tracks.png`)
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              autoSave(`tracks.svg`)
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
                console.log('Clearing query', query.toString())
                resetQuery()
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

        <ResizableSidebar
          side="right"
          //open={showSideBar}
          //onOpenChange={setShowSideBar}
        >
          <ExtScrollCard
            variant="content"
            className="px-2 pb-2"
            style={{
              userSelect: isCtrlPressed ? 'none' : 'auto',
            }}
          >
            <TracksView
              style={{
                pointerEvents: isCtrlPressed ? 'none' : 'auto',
              }}
            />
          </ExtScrollCard>

          <SeqBrowserPropsPanel />
        </ResizableSidebar>

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
          <ZoomSlider />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function SeqBrowserQueryPage() {
  return (
    <CoreProviders>
      <SeqBrowserPage />
    </CoreProviders>
  )
}
