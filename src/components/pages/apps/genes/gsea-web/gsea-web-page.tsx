'use client'

import { ToolbarOpenFile } from '@/toolbar/toolbar-open-files'

import { Toolbar, ToolbarMenu, ToolbarPanel } from '@/toolbar/toolbar'

import {
  onBinaryFileChange,
  type IBinaryFileOpen,
} from '@/components/pages/open-files'

import { ToolbarTabGroup } from '@/toolbar/toolbar-tab-group'

import { LayersIcon } from '@/icons/layers-icon'

import { OpenIcon } from '@/icons/open-icon'

import { DropdownMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { UploadIcon } from '@/icons/upload-icon'

import {
  DOCS_URL,
  TEXT_DISPLAY,
  TEXT_DOWNLOAD_AS_PNG,
  TEXT_DOWNLOAD_AS_SVG,
  TEXT_EXPORT,
  TEXT_FILE,
  TEXT_OPEN,
  TEXT_OPEN_FILE,
  TEXT_SAVE_IMAGE,
} from '@/consts'
import { ShortcutLayout } from '@/layouts/shortcut-layout'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

import type { ITab } from '@/components/tabs/tab-provider'

import { Checkbox } from '@/themed/v2/check-box'
import { ToolbarIconButton } from '@/toolbar/toolbar-icon-button'

import { Autocomplete, AutocompleteLi } from '@/components/autocomplete'
import { useDialogs } from '@/components/dialogs/dialogs'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FileDropZonePanel } from '@/components/file-dropzone-panel'
import { AppInfoButton } from '@/components/header/app-info-button'
import { HeaderPortal } from '@/components/header/header-portal'
import { DownloadIcon } from '@/components/icons/download-icon'
import { ThemeLink } from '@/components/link/theme-link'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { FooterPortal } from '@/components/toolbar/footer-portal'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ZoomSlider } from '@/components/toolbar/zoom-slider'
import { ToolbarHelpTabGroup } from '@/help/toolbar-help-tab-group'
import { ExportIcon } from '@/icons/export-icon'
import { FileImageIcon } from '@/icons/file-image-icon'
import { SearchIcon } from '@/icons/search-icon'
import { SlidersIcon } from '@/icons/sliders-icon'
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { BoolSearchQuery } from '@/lib/search'
import { CoreProviders } from '@/providers/core-providers'
import { useZoom } from '@/providers/zoom-provider'
import { Card } from '@/themed/card'
import Fuse from 'fuse.js'
import { produce } from 'immer'
import { PLOT_CLS } from '../../matcalc/apps/heatmap/heatmap-panel'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { GeneSetsPropsPanel } from './gene-sets-props-panel'
import { GseaDisplayPropsPanel } from './gsea-display-props-panel'
import { useGseaSettings } from './gsea-settings-store'
import {
  PLOT_ZOOM_CHANNEL,
  useGseaWebStore,
  type IGseaPathway,
} from './gsea-web-store'

import { AppHeaderIcon } from '@/components/header/app-header-icon'
import { OPTS_SIDEBAR_ID } from '@/components/slide-bar/resizable-sidebar'
import { GseaSvg } from '../gsea-plot/gsea-svg'
import APP_INFO from './manifest.json'

const HELP_URL = DOCS_URL + '/apps/gsea'

const LI_CLS =
  'border border-border/25 p-4 rounded-lg bg-background shadow-xs hover:shadow-lg trans-shadow'

export function GseaWebPage() {
  //const _id = useStableId('gsea-page')

  const { settings: edbSettings } = useEdbSettings()
  const { settings, updateSettings } = useGseaSettings()

  const [rightTab, setRightTab] = useState('Gene Sets')
  const [showSideBar, setShowSideBar] = useState(true)
  const { setAppInfo } = useAppInfo()

  const [search, setSearch] = useState('')

  const {
    phenotypes,
    rankedGenes,
    reportsMap,
    datasetsForUse,
    setDatasetsForUse,
    loadGseaZip,
  } = useGseaWebStore()

  const [searchResults, setSearchResults] = useState<IGseaPathway[]>([])

  const svgRef = useRef<SVGSVGElement>(null)

  const [toolbarTab, setToolbarTab] = useState('Home')

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const [selectedTab] = useState(0)

  const [showFileMenu, setShowFileMenu] = useState(false)
  //const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  const [reportTabs, setReportTabs] = useState<string[]>([])

  const { open: openDialog } = useDialogs()

  useEffect(() => {
    setAppInfo(APP_INFO)
  }, [])

  useEffect(() => {
    setReportTabs(['gsea-results', ...phenotypes])
  }, [phenotypes])

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.page.scale = zoom
      })
    )
  }, [zoom])

  const searchIndex = useMemo(() => {
    return new Fuse(phenotypes.map((k) => reportsMap[k]!).flat(), {
      keys: ['phen', 'name'], // Fields to search
      threshold: 0.3, // Fuzzy match level
    })
  }, [reportsMap])

  const tabs: ITab[] = [
    {
      id: 'Home',
      content: (
        <>
          <ToolbarTabGroup title={TEXT_FILE}>
            <ToolbarOpenFile
              onOpen={() => {
                openDialog({
                  type: 'open',
                  payload: {
                    callback: (message, files) => {
                      onBinaryFileChange(message, files, loadGseaZip)
                    },
                  },
                })
              }}
              multiple={true}
            />

            {selectedTab === 0 && (
              <ToolbarIconButton
                title={TEXT_SAVE_IMAGE}
                onClick={() => {
                  openDialog({
                    type: 'save-image',
                    payload: {
                      name: 'gsea',
                      svgRef,
                    },
                  })
                }}
              >
                <DownloadIcon />
              </ToolbarIconButton>
            )}
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Plot Size">
            <DoubleNumericalInput
              h="md"
              v1={settings.axes.x.length}
              placeholder="Width"
              limit={[1, 1000]}
              dp={0}
              onNumChange1={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.x.length = v
                  })
                )
              }}
              v2={settings.es.axes.y.length}
              onNumChange2={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.es.axes.y.length = v
                  })
                )
              }}
            />
          </ToolbarTabGroup>

          <ToolbarTabGroup title="Columns">
            <NumericalInput
              value={settings.page.columns}
              h="md"
              placeholder="Opacity"
              limit={[1, 100]}
              step={1}
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.page.columns = v
                  })
                )
              }}
              className="w-16 rounded-theme"
            />
          </ToolbarTabGroup>
        </>
      ),
    },
    {
      id: 'Help',
      content: <ToolbarHelpTabGroup url={HELP_URL} />,
    },
  ]

  const rightTabs: ITab[] = useMemo(() => {
    return [
      {
        icon: <LayersIcon />,
        id: 'Gene Sets',
        content: <GeneSetsPropsPanel />,
      },
      {
        id: TEXT_DISPLAY,
        icon: <SlidersIcon />,
        content: <GseaDisplayPropsPanel />,
      },
    ]
  }, [datasetsForUse, reportTabs])

  const fileMenuTabs: ITab[] = [
    {
      //id: nanoid(),
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      content: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openDialog({
              type: 'open',
              payload: {
                callback: (message, files) => {
                  onBinaryFileChange(message, files, loadGseaZip)
                },
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
      content: (
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

    loadGseaZip([file])
  }

  function handleSearch(query: string) {
    setSearch(query)

    if (!searchIndex) {
      return
    }

    //console.log('q', query)

    //const results = searchIndex.search(query)

    if (query === '') {
      setSearchResults([])
      return
    }

    const q = new BoolSearchQuery(query)

    setSearchResults(
      phenotypes
        .map((k) =>
          reportsMap[k]!.filter(
            (r) => q.match(k) || q.match(r.phen) || q.match(r.name)
          )
        )
        .flat()
    )

    //setSearchResults(results.map(result => result.item))
  }

  return (
    <>
      {/* <DialogsRoot /> */}

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
                        checked={datasetsForUse[item.id] ?? false}
                        onCheckedChange={() => {
                          setDatasetsForUse(
                            Object.fromEntries([
                              ...Object.entries(datasetsForUse),
                              [item.id, !datasetsForUse[item.id]],
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
      </HeaderPortal>

      <ShortcutLayout signinRequired={false}>
        <Toolbar>
          <ToolbarMenu
            groupId="gsea-toolbar"
            tabs={tabs}
            open={showFileMenu}
            onOpenChange={setShowFileMenu}
            value={toolbarTab}
            onValueChange={setToolbarTab}
            fileMenuTabs={fileMenuTabs}
            leftShortcuts={<UndoShortcuts />}
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
            groupId="gsea-toolbar"
            tabs={tabs}
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar
          id={OPTS_SIDEBAR_ID}
          side="right"
          tabs={rightTabs}
          value={rightTab}
          onTabChange={(selectedTab) => setRightTab(selectedTab.tab.id)}
          open={showSideBar}
          onOpenChange={setShowSideBar}
          className="pr-2"
        >
          {rankedGenes.length > 0 ? (
            <FileDropZonePanel
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onBinaryFileChange('Open zip', files, loadGseaZip)
                }
              }}
            >
              <Card variant="content" className="mx-2 mb-2 grow">
                <div className={PLOT_CLS}>
                  <GseaSvg ref={svgRef} />
                </div>
              </Card>
            </FileDropZonePanel>
          ) : (
            <FileDropZonePanel
              onFileDrop={(files) => {
                if (files.length > 0) {
                  //setDroppedFile(files[0]);
                  console.log('Dropped file:', files[0])

                  onBinaryFileChange('Open zip', files, loadGseaZip)
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
        </TabSlideBar>

        <FooterPortal>
          <></>
          <></>
          <ZoomSlider channel={PLOT_ZOOM_CHANNEL} />
        </FooterPortal>
      </ShortcutLayout>
    </>
  )
}

export function GseaWebQueryPage() {
  return (
    <CoreProviders>
      <GseaWebPage />
    </CoreProviders>
  )
}
