import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { FontPopover } from '@/components/plot/font/font-popover'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
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
      <SideBarHeader className="justify-end">
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: TEXT_RESET,
                content: 'Are you sure you want to reset all settings?',
                callback: (r) => {
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
      </SideBarHeader>
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
                    update: (textProps) =>
                      updateSettings(
                        produce(settings, (draft) => {
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
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.chrPrefix.show = state
                  })
                )
              }
            />

            <CheckPropRow
              title="Prioritize Variants"
              checked={settings.variants.prioritizeVariantTypeOrder}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
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
                onValueChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.variants.sortOrder = v as SortOrder
                      draft.variants.colorBy = v as CMAPName
                    })
                  )
                }}
              >
                {SORT_ORDER.map((o) => {
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
              onCheckedChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
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
            <PropRow title="Line">
              <VCenterRow>
                <OutlineButton
                  colors={[
                    {
                      color: settings.mafs.plot.line.value,
                      opacity: settings.mafs.plot.line.opacity,
                      show: settings.mafs.plot.line.show,
                      onColorChange: ({
                        color,
                        opacity,
                        width,
                        dasharray,
                        show,
                      }) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.mafs.plot.line.value = color
                            draft.mafs.plot.line.opacity =
                              opacity ?? draft.mafs.plot.line.opacity
                            draft.mafs.plot.line.width =
                              width ?? draft.mafs.plot.line.width
                            draft.mafs.plot.line.dasharray =
                              dasharray ?? draft.mafs.plot.line.dasharray
                            draft.mafs.plot.line.show =
                              show ?? draft.mafs.plot.line.show
                          })
                        ),
                      title: 'Line Color',
                    },
                  ]}

                  title="MAF Outline"
                />

                <FillButton
                  colors={[
                    {
                      color: settings.mafs.plot.fill.value,
                      opacity: settings.mafs.plot.fill.opacity,
                      show: settings.mafs.plot.fill.show,
                      onColorChange: ({ color, opacity, show }) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.mafs.plot.fill.value = color
                            draft.mafs.plot.fill.opacity =
                              opacity ?? draft.mafs.plot.fill.opacity
                            draft.mafs.plot.fill.show =
                              show ?? draft.mafs.plot.fill.show
                          })
                        ),
                      title: 'Fill Color',
                    },
                  ]}

                  title="MAF Fill"
                />
              </VCenterRow>
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="dna">
          <AccordionTrigger
            rightChildren={
              <Switch
                title={TEXT_SHOW}
                checked={settings.dna.text.show}
                onCheckedChange={(state) => {
                  updateSettings(
                    produce(settings, (draft) => {
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
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.dna.index.text.show = state
                  })
                )
              }}
            />

            <PropRow title="Border">
              <OutlineButton
                colors={[
                  {
                    color: settings.dna.border.value,
                    opacity: settings.dna.border.opacity,
                    show: settings.dna.border.show,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.dna.border.value = color
                          draft.dna.border.opacity =
                            opacity ?? draft.dna.border.opacity
                          draft.dna.border.width =
                            width ?? draft.dna.border.width
                          draft.dna.border.dasharray =
                            dasharray ?? draft.dna.border.dasharray
                          draft.dna.border.show = show ?? draft.dna.border.show
                        })
                      ),
                  },
                ]}

                title="DNA Border"
              />
            </PropRow>

            <CheckPropRow
              title="Motifs"
              checked={settings.dna.motifs.show}
              onCheckedChange={(v) =>
                updateSettings(
                  produce(settings, (draft) => {
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
                onCheckedChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
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
                  onCheckedChange={(v) =>
                    updateSettings(
                      produce(settings, (draft) => {
                        const motif = draft.motifs.patterns.find(
                          (x) => x.name === pattern.name
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
