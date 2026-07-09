import { ChevronUpDownIcon } from '@/components/icons/chevron-up-down-icon'
import { HCenterRow } from '@/components/layout/h-center-row'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import {
  Popover,
  PopoverContent,
  PopoverMenuItem,
  PopoverSpeechArrow,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { RadioPropRow } from '@/dialogs/radio-prop-row'
import { SettingsAccordionItem } from '@/dialogs/settings/settings-dialog'

import { produce } from 'immer'
import { ExternalLinkIcon } from 'lucide-react'

import { RadioGroup } from '@/components/shadcn/ui/themed/v2/radio-group'
import { SkeletonRows } from '@/components/shadcn/ui/themed/v2/skeleton'
import { storeItem } from '@/lib/storage'
import { useEffect, useState } from 'react'
import { useMatcalcSettings } from '../../settings/matcalc-settings'
import type { IGexDataset } from './gex-store'
import { metadataToShared } from './gex-utils'

export const GENOMES = Object.freeze(['Human', 'Mouse'])

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

  if (showSkeleton) {
    return <SkeletonRows className="w-7/10 mx-auto" />
  }

  return (
    <>
      <HCenterRow>
        <Popover>
          <PopoverTrigger className="font-bold text-xs flex flex-row items-center gap-x-4 w-48 justify-between hover:bg-muted/70 data-popup-open:bg-muted/70 rounded-theme p-2.5 trans-color">
            <span>{`${settings.apps.gex.genome} ${technology ?? ''}`}</span>
            <ChevronUpDownIcon />
          </PopoverTrigger>
          <PopoverContent
            //variant="content"
            className="w-48 flex flex-col gap-y-4 relative"
            sideOffset={12}
            align="center"
          >
            <PopoverSpeechArrow />

            <HCenterRow className="pt-2">
              <ToggleGroup
                //variant="outline"

                value={[settings.apps.gex.genome]}
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.apps.gex.genome = v[0] ?? ''
                    })
                  )
                }}
                rounded="none"
                className="border border-border/50 rounded-theme overflow-hidden"
              >
                {GENOMES.map((s) => (
                  <GroupToggle
                    key={s}
                    value={s}
                    className="w-20"
                    aria-label="Filter rows"
                  >
                    {s}
                  </GroupToggle>
                ))}
              </ToggleGroup>
            </HCenterRow>
            <ul className="flex flex-col">
              {TECHNOLOGIES.map((t, tid) => {
                return (
                  <li key={tid}>
                    <PopoverMenuItem
                      checked={t === technology}
                      data-selected={t === technology}
                      variant="theme"
                      animation="none"
                      // ripple={false}
                      className="w-full text-left"
                      onClick={() => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.apps.gex.technology = t
                          })
                        )
                        setTechnology(t)
                      }}
                    >
                      {t}
                    </PopoverMenuItem>
                  </li>
                )
              })}
            </ul>
          </PopoverContent>
        </Popover>
      </HCenterRow>

      <RadioGroup
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
          //onValueChange={setAccordionValues}
          variant="settings"
        >
          {institutions.map((institution) => {
            return (
              <SettingsAccordionItem
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
                            <ExternalLinkIcon size={20} />
                          </button>
                        </RadioPropRow>
                      </li>
                    )
                  })}
                </ul>
              </SettingsAccordionItem>
            )
          })}
        </ScrollAccordion>
      </RadioGroup>
    </>
  )
}
