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
  TEXT_DISPLAY,
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
import { useAppInfo, useEdbSettings } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { downloadSvgAutoFormat } from '@/lib/image-utils'
import { BoolSearchQuery } from '@/lib/search'
import { CoreProviders } from '@/providers/core-provider'
import { useZoom } from '@/providers/zoom-provider'
import Fuse from 'fuse.js'
import { produce } from 'immer'

import { TabSlideBar } from '@/components/slide-bar/tab-slide-bar'
import { useSideTabs, useToolbarTabs } from '@/components/tabs/tab-provider'
import { SVGProvider, useSVG } from '@/providers/svg-provider'
import { OptsSidebarMenu } from '../../matcalc/data/opts-sidebar-menu'
import { UndoShortcuts } from '../../matcalc/history/undo-shortcuts'
import { GeneSetsPropsPanel } from './geneset-props-panel'
import { GseaDisplayPropsPanel } from './gsea-display-props-panel'
import {
  PLOT_ZOOM_CHANNEL,
  useGseaPlotStore,
  type IGseaPathway,
} from './gsea-plot-store'
import { useGseaSettings } from './gsea-settings-store'
import { GseaSvg } from './gsea-svg'
import APP_INFO from './manifest.json'
import { HomeToolbar } from './toolbars/home'

const HELP_URL = DOCS_URL + '/apps/gsea'

const LI_CLS =
  'border border-border/25 p-4 rounded-lg bg-background shadow-xs hover:shadow-lg trans-shadow'

export function GseaPlotPage() {
  //const _id = useStableId('gsea-page')

  const { settings: edbSettings } = useEdbSettings()
  const { settings, updateSettings } = useGseaSettings()
  const { setAppInfo } = useAppInfo()

  const [search, setSearch] = useState('')

  const {
    phenotypes,
    rankedGenes,
    reportsMap,
    datasetsForUse,

    setDatasetsForUse,
    loadGseaZip,
  } = useGseaPlotStore()

  const [searchResults, setSearchResults] = useState<IGseaPathway[]>([])

  const [toolbarTab, setToolbarTab] = useState('Home')

  const { zoom } = useZoom(PLOT_ZOOM_CHANNEL)

  const [showFileMenu, setShowFileMenu] = useState(false)
  //const [selectAllDatasets, setSelectAllDatasets] = useState(true)

  const [reportTabs, setReportTabs] = useState<string[]>([])

  const { svgRef } = useSVG()
  const { setTabs: setToolbarTabs } = useToolbarTabs()
  const { setTabs: setSideTabs } = useSideTabs()

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
        id: 'Gene Sets',
        component: GeneSetsPropsPanel,
      },
      {
        id: TEXT_DISPLAY,
        component: GseaDisplayPropsPanel,
      },
    ])
  }, [setSideTabs])

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

  const fileMenuTabs: ITab[] = [
    {
      id: TEXT_OPEN,
      icon: <OpenIcon variant="colorful" />,
      component: (
        <DropdownMenuItem
          aria-label={TEXT_OPEN_FILE}
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onBinaryFileChange(message, files, loadGseaZip)
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
      component: (
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
            tabShortcutMenu={
              <OptsSidebarMenu open={edbSettings.sidebar.show} />
            }
          />
        </Toolbar>

        <TabSlideBar side="right">
          {rankedGenes.length > 0 ? (
            <FileDropZonePanel
              className="grow"
              onFileDrop={(files) => {
                if (files.length > 0) {
                  onBinaryFileChange('Open zip', files, loadGseaZip)
                }
              }}
            >
              <ExtScrollCard className="mx-2 mb-2 grow">
                <GseaSvg ref={svgRef} />
              </ExtScrollCard>
            </FileDropZonePanel>
          ) : (
            <FileDropZonePanel
              className="grow"
              onFileDrop={(files) => {
                if (files.length > 0) {
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

          {/* <GseaPropsPanel id={OPTS_SIDEBAR_ID} /> */}
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

export function GseaPlotQueryPage() {
  return (
    <CoreProviders>
      <SVGProvider>
        <GseaPlotPage />
      </SVGProvider>
    </CoreProviders>
  )
}
