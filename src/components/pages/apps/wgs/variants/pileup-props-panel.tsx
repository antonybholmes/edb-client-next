import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { PropRow } from '@/components/dialog/prop-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import { PropsPanel } from '@/components/props-panel'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import {
  NO_DIALOG,
  TEXT_OK,
  TEXT_RESET,
  TEXT_SHOW,
  type IDialogParams,
} from '@/consts'
import type { IDivProps } from '@/interfaces/div-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
import { useState } from 'react'
import {
  SORT_ORDER,
  useVariantSettings,
  type CMAPName,
  type SortOrder,
} from './variant-settings-store'

export interface IProps extends IDivProps {
  onDBChange?: (index: number) => void
}

export function PileupPropsPanel({ ref }: IProps) {
  const { settings, updateSettings, resetSettings } = useVariantSettings()
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  return (
    <>
      {showDialog.id.startsWith('reset') && (
        <OKCancelDialog
          //open={delGroup !== -1}
          onResponse={r => {
            if (r === TEXT_OK) {
              resetSettings()
            }
            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to reset all settings?
        </OKCancelDialog>
      )}

      <PropsPanel ref={ref} className="pr-2">
        <VCenterRow className="justify-end">
          <LinkButton
            onClick={() => {
              setShowDialog({ id: 'reset', params: {} })
            }}
            title="Reset plots to default view"
          >
            {TEXT_RESET}
          </LinkButton>
        </VCenterRow>
        <ScrollAccordion
          value={['pileup', 'maf', 'dna', 'motifs']}
          variant="sidebar"
        >
          <AccordionItem value="pileup">
            <AccordionTrigger variant="sidebar">Pileup</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <CheckPropRow
                title="Add chr prefix"
                checked={settings.chrPrefix.show}
                onCheckedChange={state =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.chrPrefix.show = state
                    })
                  )
                }
              />

              <CheckPropRow
                title="Prioritize variants"
                checked={settings.variants.prioritizeVariantTypeOrder}
                onCheckedChange={state =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.variants.prioritizeVariantTypeOrder = state
                    })
                  )
                }
              >
                <InfoHoverCard>
                  Reduce whitespace in plot by plotting DELs before SNVs and
                  INSs.
                </InfoHoverCard>
              </CheckPropRow>

              <PropRow title="Sort by">
                <SelectList
                  items={SORT_ORDER}
                  value={settings.variants.sortOrder}
                  onValueChange={v => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.variants.sortOrder = v as SortOrder
                        draft.variants.colorBy = v as CMAPName
                      })
                    )
                  }}
                >
                  {SORT_ORDER.map(o => {
                    return (
                      <SelectItem value={o.value} key={o.value}>
                        {o.label}
                      </SelectItem>
                    )
                  })}
                </SelectList>
              </PropRow>

              {/* 
              <PropRow title="Colormap">
                <SelectList
                  items={CMAP_ORDER}
                  value={settings.variants.colorBy}
                  onValueChange={v => {
                    updateSettings(
                      produce(settings, draft => {
                        draft.variants.colorBy = v as CMAPName
                      })
                    )
                  }}
                >
                  {SORT_ORDER.map(o => {
                    return (
                      <SelectItem value={o.value} key={o.value}>
                        {o.label}
                      </SelectItem>
                    )
                  })}
                </SelectList>
              </PropRow> */}

              <CheckPropRow
                title="Tooltips"
                checked={settings.tooltips.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.tooltips.show = v
                    })
                  )
                }
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="maf">
            <AccordionTrigger variant="sidebar">MAF</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <CheckPropRow
                title="Line"
                checked={settings.mafs.plot.line.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.mafs.plot.line.show = v
                    })
                  )
                }
              >
                <ColorPickerButton
                  color={settings.mafs.plot.line.color}
                  onColorChange={color =>
                    updateSettings(
                      produce(settings, draft => {
                        draft.mafs.plot.line.color = color
                      })
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Line color"
                />
              </CheckPropRow>

              <CheckPropRow
                title="Fill"
                checked={settings.mafs.plot.fill.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.mafs.plot.fill.show = v
                    })
                  )
                }
              >
                <ColorPickerButton
                  allowAlpha={true}
                  color={settings.mafs.plot.fill.color}
                  opacity={settings.mafs.plot.fill.opacity}
                  onColorChange={(color, opacity) =>
                    updateSettings(
                      produce(settings, draft => {
                        draft.mafs.plot.fill.color = color
                        draft.mafs.plot.fill.opacity = opacity
                      })
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Fill color"
                />
              </CheckPropRow>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="dna">
            <AccordionTrigger variant="sidebar">DNA</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <CheckPropRow
                title="Show"
                checked={settings.dna.show}
                onCheckedChange={state => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.dna.show = state
                    })
                  )
                }}
              />
              <CheckPropRow
                title="Index"
                checked={settings.dna.index.show}
                onCheckedChange={state => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.dna.index.show = state
                    })
                  )
                }}
              />

              <CheckPropRow
                title="Border"
                checked={settings.dna.border.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.dna.border.show = v
                    })
                  )
                }
              >
                <ColorPickerButton
                  color={settings.dna.border.color}
                  onColorChange={color =>
                    updateSettings(
                      produce(settings, draft => {
                        draft.dna.border.color = color
                      })
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Border color"
                />
              </CheckPropRow>

              <CheckPropRow
                title="Motifs"
                checked={settings.dna.motifs.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.dna.motifs.show = v
                    })
                  )
                }
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="motifs">
            <AccordionTrigger variant="sidebar">Motifs</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <CheckPropRow
                title={TEXT_SHOW}
                checked={settings.motifs.show}
                onCheckedChange={v =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.motifs.show = v
                    })
                  )
                }
              />

              {settings.motifs.patterns.map((pattern, pi) => {
                return (
                  <CheckPropRow
                    title={pattern.name}
                    key={pi}
                    checked={pattern.show}
                    onCheckedChange={v =>
                      updateSettings(
                        produce(settings, draft => {
                          const motif = draft.motifs.patterns.find(
                            x => x.name === pattern.name
                          )

                          if (motif) {
                            motif.show = v
                          }
                        })
                      )
                    }
                  />
                )
              })}
            </AccordionContent>
          </AccordionItem>

          {/* <AccordionItem value="colormap">
            <AccordionTrigger variant="sidebar">Colormap</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <RadioGroup
                value={settings.variants.colorBy}
                onValueChange={value =>
                  updateSettings(
                    produce(settings, draft => {
                      draft.variants.colorBy = value as CMAPName
                    })
                  )
                }
                className="flex flex-col gap-y-2"
              >
                {CMAP_ORDER.map(o => {
                  return (
                    <RadioGroupItem value={o.value} id={o.value} key={o.value}>
                      {o.label}
                    </RadioGroupItem>
                  )
                })}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem> */}
        </ScrollAccordion>
      </PropsPanel>
    </>
  )
}
