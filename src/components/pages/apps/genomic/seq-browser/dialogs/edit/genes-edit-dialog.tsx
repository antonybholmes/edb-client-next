import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { FontUI } from '@/components/plot/font/font-ui'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { ColorPropRow } from '@/dialogs/color-prop-row'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { PropRow } from '@/dialogs/prop-row'
import { SettingsAccordionItem } from '@/dialogs/settings/settings-dialog'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { produce } from 'immer'
import { useState } from 'react'
import {
  GENE_DISPLAY_OPTIONS,
  useSeqBrowserSettings,
  type GeneDisplay,
  type GeneView,
} from '../../seq-browser-settings'
import type { IGeneTrack, ITrackGroup } from '../../tracks-provider'

export interface IProps extends IModalProps<{
  group: ITrackGroup
  track: IGeneTrack
}> {
  group: ITrackGroup
  track: IGeneTrack
}

export function GenesEditDialog({ group, track, onResponse }: IProps) {
  const [_track, setTrack] = useState(track)
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title={_track.name}
      onResponse={() => {
        onResponse?.(TEXT_CANCEL, undefined)
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      //overlayColor="trans"
    >
      <ScrollAccordion
        value={['labels', 'appearance', 'canonical-genes', 'display-density']}
        variant="settings"
        className="h-80"
      >
        <SettingsAccordionItem
          title="Labels"
          description="Configure how genes are labelled"
          showBorder={false}
        >
          <PropRow title="Font" side="right">
            <FontUI
              title="Gene Labels"
              view="compact"
              showAlign={false}
              showColor={false}
              textProps={settings.tracks.genes.labels.text}
              update={(textProps) => {
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.labels.text = textProps
                })

                updateSettings(newSettings)
              }}
            />
          </PropRow>

          <SwitchPropRow
            title="Add gene Id"
            side="right"
            disabled={!settings.tracks.genes.labels.text.show}
            checked={settings.tracks.genes.labels.showGeneId}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.labels.showGeneId = v
              })

              updateSettings(newSettings)
            }}
            className="grow ml-3"
          />
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Appearance"
          description="Customize the appearance of genes."
        >
          <SwitchPropRow
            checked={settings.tracks.genes.stroke.show}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.stroke.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Stroke"
                side="left"
                colors={[
                  {
                    color: settings.tracks.genes.stroke.value,
                    onColorChange: ({ color }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.stroke.value = color
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="W">
              <NumericalInput
                value={settings.tracks.genes.stroke.width}
                disabled={!settings.tracks.genes.stroke.show}
                placeholder="Stroke..."
                w="xxs"
                onNumChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.stroke.width = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.tracks.genes.exons.show}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.exons.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Exons"
                side="left"
                colors={[
                  {
                    color: settings.tracks.genes.exons.fill.value,
                    onColorChange: ({ color }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.exons.fill.value = color
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.tracks.genes.exons.height}
                disabled={!settings.tracks.genes.exons.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.exons.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.tracks.genes.cds.show}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.cds.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="CDS"
                side="left"
                colors={[
                  {
                    color: settings.tracks.genes.cds.fill.value,
                    onColorChange: ({ color }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.cds.fill.value = color
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.tracks.genes.cds.height}
                disabled={!settings.tracks.genes.cds.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.cds.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.tracks.genes.utrs.show}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.utrs.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="UTRs"
                side="left"
                colors={[
                  {
                    color: settings.tracks.genes.utrs.fill.value,
                    onColorChange: ({ color }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.utrs.fill.value = color
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.tracks.genes.utrs.height}
                disabled={!settings.tracks.genes.utrs.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.utrs.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.tracks.genes.arrows.show}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.arrows.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Arrows"
                side="left"
                colors={[
                  {
                    color: _track.displayOptions.arrows.stroke.value,
                    onColorChange: ({ color }) => {
                      const newTrack = produce(_track, (draft) => {
                        draft.displayOptions.arrows.stroke.value = color
                      })

                      onResponse?.(TEXT_OK, { group, track: newTrack })
                      setTrack(newTrack)
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <DoubleNumericalInput
              v1={_track.displayOptions.arrows.x}
              v2={_track.displayOptions.arrows.y}
              placeholder="Width..."
              dp={0}
              w="xxs"
              onNumChange1={(v) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.arrows.x = v
                })

                onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)
              }}
              onNumChange2={(v) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.arrows.y = v
                })

                onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)
              }}
            />
          </SwitchPropRow>
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Canonical genes"
          description="Canonical genes can be displayed differently to other genes."
        >
          <SwitchPropRow
            checked={settings.tracks.genes.canonical.isColored}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.canonical.isColored = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Highlight canonical genes"
                side="left"
                colors={[
                  {
                    color: settings.tracks.genes.canonical.fill.value,
                    onColorChange: ({ color }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.canonical.fill.value = color
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          />

          <SwitchPropRow
            checked={settings.tracks.genes.canonical.only}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.canonical.only = v
              })

              updateSettings(newSettings)
            }}
            title="Only show canonical genes"
            side="right"
            className="ml-4"
          />
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Display Density"
          description="Control the appearance of genes to affect the display density."
        >
          <PropRow title="Display">
            <SelectList
              value={settings.tracks.genes.display}
              onValueChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.display = v as GeneDisplay
                })

                updateSettings(newSettings)
              }}
              // so items appear formatted
              items={GENE_DISPLAY_OPTIONS}
            >
              {GENE_DISPLAY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </PropRow>
          <PropRow title="View" className="items-start">
            {/* <RadioGroup
              value={settings.tracks.genes.view}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.tracks.genes.view = v as GeneView
                })

                updateSettings(newSettings)
              }}
              className="text-xs flex flex-col gap-y-2"
            >
              <RadioGroupItem value="transcript">Transcripts</RadioGroupItem>
              <RadioGroupItem value="features">Features</RadioGroupItem>
            </RadioGroup> */}

            <ToggleGroup
              value={[settings.tracks.genes.view]}
              onValueChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.view = v[0] as GeneView
                })

                updateSettings(newSettings)
              }}
              size="toolbar"
              className="rounded-theme overflow-hidden gap-x-px"
            >
              <GroupToggle value="transcript" className="w-24" rounded="none">
                Transcripts
              </GroupToggle>
              <GroupToggle value="features" className="w-24" rounded="none">
                Features
              </GroupToggle>
            </ToggleGroup>
          </PropRow>
        </SettingsAccordionItem>
      </ScrollAccordion>
    </OKCancelDialog>
  )
}
