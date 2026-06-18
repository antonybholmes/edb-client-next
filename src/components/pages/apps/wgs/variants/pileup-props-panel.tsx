import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { FontPopover } from '@/components/plot/font/font-popover'
import { PropsPanel } from '@/components/props-panel'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_OK, TEXT_RESET, TEXT_SHOW } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
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

  const { open: openDialog } = useDialogs()

  return (
    <PropsPanel ref={ref} className="pr-2">
      <VCenterRow className="justify-end">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: TEXT_RESET,
                content: 'Are you sure you want to reset all settings?',
                callback: r => {
                  if (r === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset plots to default view"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion value={['pileup', 'maf', 'dna', 'motifs']}>
        <AccordionItem value="pileup">
          <AccordionTrigger
            rightChildren={
              <FontPopover
                fonts={[
                  {
                    title: 'Bases',
                    textProps: settings.dna.text,
                    showAlign: false,
                    update: textProps =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.dna.text = textProps
                        })
                      ),
                  },
                ]}
              />
            }
          >
            Pileup
          </AccordionTrigger>
          <AccordionContent>
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
                Reduce whitespace in plot by plotting DELs before SNVs and INSs.
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
          <AccordionTrigger>MAF</AccordionTrigger>
          <AccordionContent>
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
                colors={[
                  {
                    color: settings.mafs.plot.line.value,
                    opacity: 1,
                    onColorChange: color =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.mafs.plot.line.value = color
                        })
                      ),
                    title: 'Line Color',
                  },
                ]}
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
                colors={[
                  {
                    color: settings.mafs.plot.fill.value,
                    opacity: settings.mafs.plot.fill.opacity,
                    onColorChange: (color, opacity) =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.mafs.plot.fill.value = color
                          draft.mafs.plot.fill.opacity = opacity
                        })
                      ),
                    title: 'Fill Color',
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Fill color"
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="dna">
          <AccordionTrigger
            rightChildren={
              <Switch
                title={TEXT_SHOW}
                checked={settings.dna.text.show}
                onCheckedChange={state => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.dna.text.show = state
                    })
                  )
                }}
              />
            }
          >
            DNA
          </AccordionTrigger>
          <AccordionContent>
            <CheckPropRow
              title="Index"
              checked={settings.dna.index.text.show}
              onCheckedChange={state => {
                updateSettings(
                  produce(settings, draft => {
                    draft.dna.index.text.show = state
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
                colors={[
                  {
                    color: settings.dna.border.value,
                    opacity: 1,
                    onColorChange: color =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.dna.border.value = color
                        })
                      ),
                    title: 'Border Color',
                  },
                ]}
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
          <AccordionTrigger
            rightChildren={
              <Switch
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
            }
          >
            Motifs
          </AccordionTrigger>
          <AccordionContent>
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
      </ScrollAccordion>
    </PropsPanel>
  )
}
