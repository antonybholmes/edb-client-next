import { BaseCol } from '@/layout/base-col'

import { VCenterRow } from '@/layout/v-center-row'

import { CollapseTree, makeFoldersRootNode } from '@/components/collapse-tree'
import { MultiSelectIcon } from '@/components/icons/multi-select-icon'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import {
  ResizablePanel,
  ResizablePanelGroup,
  ThinVResizeHandle,
} from '@/components/shadcn/ui/themed/resizable'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownSortOrderGroup,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import type { ITab } from '@/components/tabs/tab-provider'
import { V_SCROLL_CHILD_CLS, VScrollPanel } from '@/components/v-scroll-panel'
import { appsConfig } from '@/config/apps'
import { makeUuid } from '@/lib/id'
import { produce } from 'immer'
import { ArrowDownUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import {
  useDatasets,
  type IVariantDataset,
  type IVariantSample,
} from './dataset-store'
import { useVariantSettings } from './variant-settings-store'

export function DatasetPanel() {
  const { settings, updateSettings } = useVariantSettings()
  const { datasets, datasetsInUse, datasetUseMap, setDatasetsInUse } =
    useDatasets()

  const [foldersTab, setFoldersTab] = useState<ITab>({
    ...makeFoldersRootNode(),
  })

  const [selectAll, setSelectAll] = useState(true)

  useEffect(() => {
    const sortedDatasets = [...datasets].sort((a, b) =>
      settings.datasets.sort.asc
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name)
    )

    const instituteMap = new Map<string, IVariantDataset[]>()

    for (const dataset of sortedDatasets) {
      if (!instituteMap.has(dataset.institution)) {
        instituteMap.set(dataset.institution, [])
      }

      instituteMap.get(dataset.institution)?.push(dataset)
    }

    const institutions = [
      ...[...instituteMap.keys()]
        .filter(inst => inst === appsConfig.wgs.defaultInstitution)
        .sort(),

      ...[...instituteMap.keys()]
        .filter(inst => inst !== appsConfig.wgs.defaultInstitution)
        .sort(),
    ]

    const children: ITab[] = institutions.map(inst => {
      const children = sortedDatasets
        .filter(dataset => dataset.institution === inst)
        .map(dataset => {
          return {
            id: dataset.id,
            name: dataset.name,
            //icon: <FolderIcon />,
            //isOpen: true,
            data: dataset.samples,
            checked: datasetUseMap[dataset.id],
            // onCheckedChange: (state: boolean) => {
            //   onCheckedChange(dataset, state)
            // },
          } as ITab
        })

      return {
        id: makeUuid(),
        name: inst,
        //icon: <FolderIcon />,
        isOpen: true,
        children,
      } as ITab
    })

    const tab: ITab = {
      ...makeFoldersRootNode(),
      type: 'folder',
      children: [
        {
          id: 'datasets',
          name: 'Datasets',
          children,
          isOpen: true,
          type: 'folder',
        },
      ],
    }

    setFoldersTab(tab)
  }, [datasets, datasetsInUse, settings.datasets.sort.asc])

  // See which samples are in the selected datasets.
  // Samples can be in multiple datasets, so use a map to deduplicate.
  const samples = useMemo(() => {
    const sampleMap = new Map<string, IVariantSample>()

    for (const dataset of datasetsInUse) {
      for (const sample of dataset.samples) {
        sampleMap.set(sample.id, sample)
      }
    }

    const samples = [...sampleMap.values()].sort((a, b) =>
      a.name.localeCompare(b.name)
    )

    return samples
  }, [datasetsInUse])

  return (
    <ResizablePanelGroup orientation="vertical" className="pl-2">
      <ResizablePanel className="flex flex-col" defaultSize="50%" minSize="10%">
        <VCenterRow className="justify-end">
          <IconButton
            title="Select"
            onClick={() => {
              setDatasetsInUse(
                Object.fromEntries(
                  datasets.map(dataset => [dataset.id, !selectAll])
                )
              )

              setSelectAll(!selectAll)
            }}
          >
            <MultiSelectIcon checked={selectAll} />
          </IconButton>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <IconButton
                  // ripple={false}
                  /* onClick={() => {
                    setAddedMap(new Map<string, boolean>(selectedMap.entries()))
                  }} */
                  title="Sort Items"
                >
                  <ArrowDownUp size={20} strokeWidth={1.5} />
                </IconButton>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownSortOrderGroup
                asc={settings.datasets.sort.asc}
                setAsc={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.datasets.sort.asc = v
                    })
                  )
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </VCenterRow>
        <VScrollPanel>
          <CollapseTree
            tab={foldersTab}
            //value={tab!}
            // onValueChange={t => {
            //   // only use tabs from the tree that have content, otherwise
            //   // the ui will appear empty
            //   setTab(t)
            // }}
            onCheckedChange={(tab: ITab, state: boolean) => {
              const tabId = tab.id //getTabId(tab)

              setDatasetsInUse({
                ...datasetUseMap,
                [tabId]: state,
              })
            }}
            showRoot={false}
          />
        </VScrollPanel>
      </ResizablePanel>
      <ThinVResizeHandle />
      <ResizablePanel
        id="sample-list"
        defaultSize="50%"
        minSize="10%"
        collapsible={true}
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
                      {sample.coo}, {sample.lymphgenClass}
                    </p>
                  </BaseCol>
                </li>
              )
            })}
          </ul>
        </VScrollPanel>
      </ResizablePanel>
    </ResizablePanelGroup>
  )
}
