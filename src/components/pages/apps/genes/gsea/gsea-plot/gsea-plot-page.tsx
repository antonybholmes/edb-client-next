'use client'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import {
  onBinaryFileChange,
  openFilesDialog,
  type IBinaryFileOpen,
} from '@/components/pages/open-files'

import { OpenIcon } from '@/icons/open-icon'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { UploadIcon } from '@/icons/upload-icon'

import {
  DOCS_URL,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { Fragment, useEffect, useMemo, useState } from 'react'

import type { ITab } from '@/components/tabs/tab-provider'

import { Checkbox } from '@/themed/v2/check-box'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { useAppInfo, useEdbSettings } from '@/components/edb/edb-settings'
import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { ThemeLink } from '@/components/link/theme-link'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import { ExportIcon } from '@/icons/export-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { SearchIcon } from '@/icons/search-icon'
import { httpFetch } from '@/lib/http/http-fetch'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { BoolSearchQuery } from '@/lib/search'
import { CoreProviders } from '@/providers/core-providers'
import { useZoom } from '@/providers/zoom-provider'
import Fuse from 'fuse.js'
import { produce } from 'immer'

import { ResizableSidebar } from '@/components/sidebar/resizable-sidebar'
import { useToolbarTabs } from '@/components/tabs/tab-provider'
import { useSVG } from '@/providers/svg-provider'

import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { useUpdateEffect } from '@/hooks/update-effect'
import { OptsSidebarMenu } from '../../../matcalc/data/opts-sidebar-menu'
import { UndoShortcuts } from '../../../matcalc/history/undo-shortcuts'
import { useGseaBubbleSettings } from './bubble/gsea-bubble-settings-store'
import { GseaBubbleTabPanel } from './bubble/gsea-bubble-tab-panel'
import { GeneSetFilter } from './gene-set-filter'
import {
  PLOT_ZOOM_CHANNEL,
  useGsea,
  type IGseaGeneSet,
} from './gsea-plot-store'
import { GseaPropsPanel } from './gsea-props-panel'
import { useGseaSettings } from './gsea-settings-store'
import { GseaSvg } from './gsea-svg'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home'

const HELP_URL = DOCS_URL + '/apps/gsea'

const LI_CLS =
  'border border-border/25 p-4 rounded-lg bg-background shadow-xs hover:shadow-lg trans-shadow'

export function GseaPlotPage() {
  const { settings: edbSettings } = useEdbSettings()
  const { settings, updateSettings } = useGseaSettings()
  const { settings: bubbleSettings, updateSettings: updateBubbleSettings } =
    useGseaBubbleSettings()
  const { setAppInfo } = useAppInfo()

  const [search, setSearch] = useState('')

  const {
    phenotypes,
    rankedGenes,
    filteredReports,
    geneSetsInUse,

    setGeneSetsInUse,
    loadGseaZipWithErrorHandling,
  } = useGsea()

  const [searchResults, setSearchResults] = useState<IGseaGeneSet[]>([])

  const { zoom, setZoom } = useZoom(PLOT_ZOOM_CHANNEL, {
    onChange: ({ zoom }) => {
      console.log('Zoom changed:', zoom)
      updateSettings(
        produce(settings, (draft) => {
          draft.page.scale = zoom
        })
      )

      updateBubbleSettings(
        produce(bubbleSettings, (draft) => {
          draft.page.scale = zoom
        })
      )
    },
  })

  const [showFileMenu, setShowFileMenu] = useState(false)

  const { ref: svgRef } = useSVG()
  const { setTabs: setToolbarTabs } = useToolbarTabs()

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

  useUpdateEffect(() => {
    setZoom(zoom)
  }, [settings.page.scale])

  // useHydratedUpdateEffect(
  //   () => {
  //     updateSettings(
  //       produce(settings, (draft) => {
  //         draft.page.scale = zoom
  //       })
  //     )
  //   },
  //   [zoom],
  //   hasHydrated
  // )

  const searchIndex = useMemo(() => {
    return new Fuse(filteredReports, {
      keys: ['phen', 'name'], // Fields to search
      threshold: 0.3, // Fuzzy match level
    })
  }, [filteredReports])

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      render: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onBinaryFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  loadGseaZipWithErrorHandling(files)
                })
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
      id: TEXT_EXPORT,
      icon: <ExportIcon />,
      render: (
        <>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_PNG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'gsea.png')
            }}
          >
            <FileImageIcon stroke="" />
            <span>{TEXT_DOWNLOAD_AS_PNG}</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            aria-label={TEXT_DOWNLOAD_AS_SVG}
            onClick={() => {
              downloadSvgAutoFormat(svgRef, 'gsea.svg')
            }}
          >
            <span>{TEXT_DOWNLOAD_AS_SVG}</span>
          </DropdownMenuItem>
        </>
      ),
    },
  ]

  async function loadTestData() {
    const res = await httpFetch.get('/data/test/gsea/test.gsea.zip')

    const data = await res.arrayBuffer()

    const file: IBinaryFileOpen = {
      name: 'gsea-test.zip',
      data: new Uint8Array(data),
      ext: 'zip',
    }

    loadGseaZipWithErrorHandling([file])
  }

  function handleSearch(query: string) {
    setSearch(query)

    if (!searchIndex) {
      return
    }

    if (query === '') {
      setSearchResults([])
      return
    }

    const q = new BoolSearchQuery(query)

    setSearchResults(
      filteredReports.filter((r) => q.match(r.phen) || q.match(r.name))
    )
  }

  return (
    <>
      <HeaderPortal>
        <>
          <AppHeaderIcon />
          <AppInfoButton />
        </>
        <Autocomplete
          value={search}
          onTextChange={handleSearch}
          className="w-3/4 lg:w-3/5 text-sm"
        >
          {phenotypes.map((p) => {
            return (
              // Split into each phenotype to make search cleaner
              <Fragment key={p}>
                <li
                  key={p}
                  className="px-4 py-2 text-xxs text-theme/70 font-bold"
                >
                  {p}
                </li>

                {searchResults
                  .filter((item) => item.phen === p)
                  .map((item) => (
                    <AutocompleteLi key={item.id}>
                      <SearchIcon />
                      <span className="grow">{item.name}</span>

                      <Checkbox
                        aria-label="Select gene set"
                        checked={geneSetsInUse[item.id] ?? false}
                        onCheckedChange={() => {
                          setGeneSetsInUse(
                            Object.fromEntries([
                              ...Object.entries(geneSetsInUse),
                              [item.id, !geneSetsInUse[item.id]],
                            ])
                          )
                        }}
                      />
                    </AutocompleteLi>
                  ))}
              </Fragment>
            )
          })}
        </Autocomplete>
        <>
          <ToggleGroup
            //direction="toolbar"
            className="text-xs"
            //rounded="none"
            size="lg"
            value={[settings.view.tab]}
            onValueChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.view.tab = v[0] as 'graph' | 'bubble'
                })
              )
            }}
          >
            <GroupToggle value="graph" className="px-2">
              Graph
            </GroupToggle>

            <GroupToggle value="bubble" className="px-2">
              Bubble
            </GroupToggle>
          </ToggleGroup>
        </>
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            open={showFileMenu}
            onOpenChange={setShowFileMenu}

            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
            fileMenuShortcuts={
              <>
                <GeneSetFilter />
              </>
            }
            rightShortcuts={
              <>
                <ToolbarButton
                  onClick={() => loadTestData()}
                  title="Load test data."
                >
                  Test data
                </ToolbarButton>
              </>
            }
          />
          <ToolbarPanel
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <ResizableSidebar>
          {rankedGenes.length > 0 ? (
            <FileDropZonePanel
              className="grow h-full"
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onBinaryFileChange(files, ({ success, files }) => {
                    if (!success) {
                      return
                    }
                    loadGseaZipWithErrorHandling(files)
                  })
                }
              }}
            >
              <Tabs
                //orientation="vertical"
                value={settings.view.tab}
                onValueChange={() => {}}
                className="grow"
              >
                <TabsContent value="graph">
                  <ExtScrollCard className="px-2 pb-2">
                    <GseaSvg />
                  </ExtScrollCard>
                </TabsContent>
                <TabsContent value="bubble">
                  <GseaBubbleTabPanel />
                </TabsContent>
              </Tabs>
            </FileDropZonePanel>
          ) : (
            <FileDropZonePanel
              className="grow h-full"
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onBinaryFileChange(files, ({ success, files }) => {
                    if (!success) {
                      return
                    }
                    loadGseaZipWithErrorHandling(files)
                  })
                }
              }}
            >
              <div className="text-sm p-8">
                <ol className="list-decimal ml-4 flex flex-col gap-y-4">
                  <li className={LI_CLS}>
                    Create a zip file of the directory containing all files from
                    the output of the{' '}
                    <ThemeLink
                      href="https://www.gsea-msigdb.org/gsea/index.jsp"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Broad Institute GSEA
                    </ThemeLink>{' '}
                    tool. These folders are in your <strong>gsea_home</strong>{' '}
                    folder and have names similar to{' '}
                    <strong>dlbcl_wt_vs_missense.Gsea.1740787471679</strong>.
                  </li>
                  <li className={LI_CLS}>
                    Upload the zip file to this tool using either the{' '}
                    <strong>Open</strong> button or by dragging the zip file
                    onto this area.
                  </li>
                  <li className={LI_CLS}>
                    Select which gene sets you want to plot. Use the{' '}
                    <strong>Display</strong> tab on the right to customize their
                    appearance. You can configure the grid layout for multiple
                    gene sets.
                  </li>
                  <li className={LI_CLS}>
                    Download the plot as an SVG or PNG image.
                  </li>
                </ol>
              </div>
            </FileDropZonePanel>
          )}

          <GseaPropsPanel />
        </ResizableSidebar>

        <FooterPortal>
          <></>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GseaPlotQueryPage() {
  return (
    <CoreProviders>
      <GseaPlotPage />
    </CoreProviders>
  )
}
