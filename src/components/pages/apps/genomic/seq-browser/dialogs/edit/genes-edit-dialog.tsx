import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FontUI } from '@/components/plot/font/font-ui'
import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { ColorPropRow } from '@/dialogs/color-prop-row'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { produce } from 'immer'
import { useState } from 'react'

import {
  DialogCard,
  DialogCardContent,
  DialogCardLabel,
} from '@/components/dialogs/card/dialog-card'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { IosGroupToggle } from '@/components/shadcn/ui/themed/v2/ios-group-toggle'
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
      bodyCls="gap-y-3"
    >
      <DialogCard>
        <DialogCardLabel title="Labels" />
        <DialogCardContent>
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
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardLabel title="Appearance" />
        <DialogCardContent>
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
                    show: settings.tracks.genes.stroke.show,
                    onColorChange: ({ color, show }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.stroke.value = color
                          draft.tracks.genes.stroke.show =
                            show ?? settings.tracks.genes.stroke.show
                        })
                      )
                    },
                  },
                ]}
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
                    show: settings.tracks.genes.exons.show,
                    onColorChange: ({ color, show }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.exons.fill.value = color
                          draft.tracks.genes.exons.show =
                            show ?? draft.tracks.genes.exons.show
                        })
                      )
                    },
                  },
                ]}
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
                    show: settings.tracks.genes.cds.show,
                    onColorChange: ({ color, show }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.cds.fill.value = color
                          draft.tracks.genes.cds.show =
                            show ?? draft.tracks.genes.cds.show
                        })
                      )
                    },
                  },
                ]}
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
                    show: settings.tracks.genes.utrs.show,
                    onColorChange: ({ color, show }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.tracks.genes.utrs.fill.value = color
                          draft.tracks.genes.utrs.show =
                            show ?? draft.tracks.genes.utrs.show
                        })
                      )
                    },
                  },
                ]}
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
                    show: settings.tracks.genes.arrows.show,
                    onColorChange: ({ color, show }) => {
                      const newTrack = produce(_track, (draft) => {
                        draft.displayOptions.arrows.stroke.value = color
                        draft.displayOptions.arrows.show =
                          show ?? draft.displayOptions.arrows.show
                      })

                      onResponse?.(TEXT_OK, { group, track: newTrack })
                      setTrack(newTrack)
                    },
                  },
                ]}
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
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardLabel title="Canonical Genes" />
        <DialogCardContent>
          <SwitchPropRow
            checked={settings.tracks.genes.canonical.isColored}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.canonical.isColored = v
              })

              updateSettings(newSettings)
            }}

            title="Highlight canonical genes"
          >
            <FillButton
              colors={[
                {
                  color: settings.tracks.genes.canonical.fill.value,
                  show: settings.tracks.genes.canonical.isColored,
                  onColorChange: ({ color, show }) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.tracks.genes.canonical.fill.value = color
                        draft.tracks.genes.canonical.isColored =
                          show ?? settings.tracks.genes.canonical.isColored
                      })
                    )
                  },
                },
              ]}
              //className={SIMPLE_COLOR_EXT_CLS}
            />
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.tracks.genes.canonical.only}
            onCheckedChange={(v) => {
              const newSettings = produce(settings, (draft) => {
                draft.tracks.genes.canonical.only = v
              })

              updateSettings(newSettings)
            }}
            title="Show canonical genes only"
            side="right"
            className="ml-4"
          />
        </DialogCardContent>
      </DialogCard>

      <DialogCard>
        <DialogCardLabel title="Display Density" />
        <DialogCardContent>
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
            <IosGroupToggle
              w={5.5}
              tabs={[
                { id: 'transcript', name: 'Transcripts' },
                { id: 'features', name: 'Features' },
              ]}
              value={[settings.tracks.genes.view]}
              onValueChange={(v, e) => {
                if (!v || v.length === 0) {
                  return
                }
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.view = v[0] as GeneView
                })

                updateSettings(newSettings)
              }}
            />
          </PropRow>
        </DialogCardContent>
      </DialogCard>
    </OKCancelDialog>
  )
}
