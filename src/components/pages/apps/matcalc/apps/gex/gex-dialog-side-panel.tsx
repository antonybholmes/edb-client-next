import { ChevronUpDownIcon } from '@/components/icons/chevron-up-down-icon'
import {
  Popover,
  PopoverContent,
  PopoverSpeechArrow,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'

import { produce } from 'immer'

import { CollapseTree, ROOT_NODE } from '@/components/collapse-tree'
import { DialogToolbar } from '@/components/dialogs/ok-cancel-dialog'
import { BaseCol } from '@/components/layout/base-col'
import { CenterRow } from '@/components/layout/center-row'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/shadcn/ui/themed/v2/radio-group'
import { SkeletonRows } from '@/components/shadcn/ui/themed/v2/skeleton'
import { ITab } from '@/components/tabs/tab-provider'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { HardDrive } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import type { IGexDataset } from './gex-store'

export const GENOMES: readonly ITab[] = Object.freeze([
  { id: 'Human', name: 'Human' },
  { id: 'Mouse', name: 'Mouse' },
])

export const TECHNOLOGIES = Object.freeze([
  'RNA-seq',
  'scRNA-seq',
  'Microarray',
])

interface IProps {
  dataset: IGexDataset | undefined
  setDataset: (dataset: IGexDataset) => void
  datasetMap: Map<string, IGexDataset>
  technology: string
  setTechnology: (technology: string) => void
  institutions: string[]
  instituteMap: Map<string, IGexDataset[]>
  accordionValues: string[]
}

export function GexDialogSidePanel({
  dataset,
  setDataset,
  datasetMap,
  technology,
  setTechnology,
  institutions,
  instituteMap,
  accordionValues,
}: IProps) {
  const { settings, updateSettings } = useMatcalcSettings()

  const [showSkeleton, setShowSkeleton] = useState(true)

  useEffect(() => {
    if (!dataset || institutions.length === 0) {
      return
    }

    const timer = setTimeout(() => {
      setShowSkeleton(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [institutions])

  const treeRootTab = useMemo(() => {
    //const lastHistoryAction = historyActions[historyActions.length - 1]!

    const nodes: ITab[] = []

    for (const institution of institutions) {
      const datasets = instituteMap.get(institution) ?? []

      if (datasets.length === 0) {
        continue
      }

      const fileNode: ITab = {
        id: institution,
        name: institution, //'Sheet', //sheet?.name ?? `File ${fi + 1}`,
        //icon: <FileSpreadsheet strokeWidth={1.5} size={18} />,
        children: [],
        // onClick: () => {
        //   setSelectedPanelTab(sheet.id)

        //   goto({ file, sheet })
        // },

        // onDelete: () => {
        //   removeFiles([{ file }]) //file.id], 'file')
        // },
        //type: 'file',
      }

      for (const [di, dataset] of datasets.entries()) {
        const datasetNode: ITab = {
          id: dataset.id,
          name: dataset.name ?? `Dataset ${di + 1}`,
          icon: (
            <HardDrive
              strokeWidth={1.5}
              size={18}
              className="group-data-[selected=true]:stroke-app-theme"
            />
          ),
          onClick: () => {
            setDataset(dataset)

            updateSettings(
              produce(settings, (draft) => {
                draft.apps.gex.selectedDatasets = [dataset.id]
              })
            )
          },
        }

        fileNode.children.push(datasetNode)
      }
      nodes.push(fileNode)
    }

    return {
      ...ROOT_NODE,
      children: nodes,
    }
  }, [institutions, instituteMap])

  if (showSkeleton) {
    return <SkeletonRows className="w-7/10 mx-auto" />
  }

  return (
    <BaseCol className="m-1 mt-4 grow gap-y-3">
      <DialogToolbar justify="center">
        <Popover>
          <PopoverTrigger className="font-bold text-xs flex flex-row items-center gap-x-4 w-48 justify-between hover:bg-muted/70 data-popup-open:bg-muted/70 rounded-theme p-2.5 trans-color">
            <span>{`${settings.apps.gex.genome} ${technology ?? ''}`}</span>
            <ChevronUpDownIcon />
          </PopoverTrigger>
          <PopoverContent
            //variant="content"
            className="w-48 flex flex-col gap-y-4 relative p-4"
            sideOffset={12}
            align="center"
          >
            <PopoverSpeechArrow />

            <CenterRow>
              <ToggleGroup
                variant="outline"

                value={[settings.apps.gex.genome]}
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.gex.genome = v[0] ?? ''
                    })
                  )
                }}
                className="gap-x-px"
              >
                {GENOMES.map((s) => (
                  <GroupToggle
                    key={s.id}
                    value={s.id}
                    className="w-20"
                    aria-label="Filter rows"
                  >
                    {s.name}
                  </GroupToggle>
                ))}
              </ToggleGroup>
            </CenterRow>
            <RadioGroup
              className="flex flex-col gap-y-2"
              value={technology}
              onValueChange={(v) => {
                setTechnology(v)
                updateSettings(
                  produce(settings, (draft) => {
                    draft.apps.gex.technology = v ?? ''
                  })
                )
              }}
            >
              {TECHNOLOGIES.map((t, tid) => {
                return (
                  <RadioGroupItem
                    key={tid}
                    value={t}
                    data-selected={t === technology}
                    className="w-full text-left"
                  >
                    {t}
                  </RadioGroupItem>
                )
              })}
            </RadioGroup>
          </PopoverContent>
        </Popover>
      </DialogToolbar>

      <VScrollPanel className="grow">
        <CollapseTree tab={treeRootTab} value={dataset?.id} showRoot={false} />
      </VScrollPanel>

      {/* <RadioGroup
        className="flex flex-col grow relative"
        value={dataset?.id}
        onValueChange={(v) => {
          const ds = datasetMap.get(v)

          if (ds) {
            setDataset(ds)

            updateSettings(
              produce(settings, (draft) => {
                draft.apps.gex.selectedDatasets = [ds.id]
              })
            )
          }
        }}
      >
        <ScrollAccordion
          value={accordionValues}

          variant="sidebar"
        >
          {institutions.map((institution) => {
            return (
              <SideAccordionItem
                title={institution}
                value={institution}
                key={institution}
              >
                <ul className="flex flex-col">
                  {instituteMap.get(institution)?.map((ds) => {
                    return (
                      <li
                        key={ds.id}
                        className="flex flex-row items-center justify-between gap-x-2"
                      >
                        <RadioPropRow title={ds.name} value={ds.id}>
                          <button
                            title={`View metadata of ${ds.name}`}
                            onClick={() => {
                              const id = storeItem(
                                'table-viewer',
                                'data',
                                JSON.stringify(metadataToShared(ds))
                              )

                              window.open(
                                `/apps/table-viewer?key=${id}`,
                                '_blank',
                                'width=800,height=600'
                              )
                            }}
                            className="opacity-30 hover:opacity-70"
                          >
                            <ExternalLinkIcon size={16} />
                          </button>
                        </RadioPropRow>
                      </li>
                    )
                  })}
                </ul>
              </SideAccordionItem>
            )
          })}
        </ScrollAccordion>
      </RadioGroup> */}
    </BaseCol>
  )
}
