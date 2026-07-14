import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FontUI } from '@/components/plot/font/font-ui'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { SelectItem, SelectList } from '@/themed/v2/select'
import { produce } from 'immer'
import { useState } from 'react'

import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
  ActionSwitchRow,
} from '@/components/dialogs/card/action-dialog-card'
import { DialogCardHeader } from '@/components/dialogs/card/dialog-card'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { IosGroupToggle } from '@/components/shadcn/ui/themed/v2/ios-group-toggle'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
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
      <ActionDialogCard>
        <DialogCardHeader title="Labels" />
        <ActionDialogCardContent>
          <ActionDialogRow title="Font">
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
          </ActionDialogRow>

          <ActionSwitchRow
            title="Add gene Id"

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
        </ActionDialogCardContent>
      </ActionDialogCard>

      <ActionDialogCard>
        <DialogCardHeader title="Appearance" />
        <ActionDialogCardContent>
          <ActionDialogRow>
            <VCenterRow className="gap-x-3">
              <Switch
                checked={settings.tracks.genes.stroke.show}
                onCheckedChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.stroke.show = v
                  })

                  updateSettings(newSettings)
                }}
                className="w-24"
              >
                Stroke
              </Switch>
              <FillButton
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
              <NumSlider
                value={settings.tracks.genes.stroke.width}
                disabled={!settings.tracks.genes.stroke.show}
                min={1}
                max={100}
                step={1}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.stroke.width = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </VCenterRow>
          </ActionDialogRow>

          <ActionDialogRow>
            <VCenterRow className="gap-x-3">
              <Switch
                checked={settings.tracks.genes.exons.show}
                onCheckedChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.exons.show = v
                  })

                  updateSettings(newSettings)
                }}

                className="w-24"
              >
                Exons
              </Switch>
              <FillButton
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
              <NumSlider
                value={settings.tracks.genes.exons.height}
                disabled={!settings.tracks.genes.exons.show}
                min={1}
                max={100}
                step={1}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.exons.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </VCenterRow>
          </ActionDialogRow>

          <ActionDialogRow>
            <VCenterRow className="gap-x-3">
              <Switch
                checked={settings.tracks.genes.cds.show}
                onCheckedChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.cds.show = v
                  })

                  updateSettings(newSettings)
                }}

                className="w-24"
              >
                CDs
              </Switch>
              <FillButton
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
              <NumSlider
                value={settings.tracks.genes.cds.height}
                disabled={!settings.tracks.genes.cds.show}
                min={1}
                max={100}
                step={1}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.cds.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </VCenterRow>
          </ActionDialogRow>

          <ActionDialogRow>
            <VCenterRow className="gap-x-3">
              <Switch
                checked={settings.tracks.genes.utrs.show}
                onCheckedChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.utrs.show = v
                  })

                  updateSettings(newSettings)
                }}
                className="w-24"
              >
                UTRs
              </Switch>
              <FillButton
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
              <NumSlider
                value={settings.tracks.genes.utrs.height}
                disabled={!settings.tracks.genes.utrs.show}
                min={1}
                max={100}
                step={1}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.utrs.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </VCenterRow>
          </ActionDialogRow>

          <ActionDialogRow>
            <VCenterRow className="gap-x-3">
              <Switch
                checked={settings.tracks.genes.arrows.show}
                onCheckedChange={(v) => {
                  const newSettings = produce(settings, (draft) => {
                    draft.tracks.genes.arrows.show = v
                  })

                  updateSettings(newSettings)
                }}
                className="w-24"
              >
                Arrows
              </Switch>
              <FillButton
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
            </VCenterRow>
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      <ActionDialogCard>
        <DialogCardHeader title="Canonical Genes" />
        <ActionDialogCardContent>
          <ActionDialogRow>
            <Switch
              checked={settings.tracks.genes.canonical.isColored}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.canonical.isColored = v
                })

                updateSettings(newSettings)
              }}
              className="w-24"
            >
              Highlight
            </Switch>
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
          </ActionDialogRow>
          <ActionDialogRow>
            <Switch
              checked={settings.tracks.genes.canonical.only}
              onCheckedChange={(v) => {
                const newSettings = produce(settings, (draft) => {
                  draft.tracks.genes.canonical.only = v
                })

                updateSettings(newSettings)
              }}
            >
              Show canonical genes only
            </Switch>
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>

      <ActionDialogCard>
        <DialogCardHeader title="Display Density" />
        <ActionDialogCardContent>
          <ActionDialogRow title="Display">
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
          </ActionDialogRow>
          <ActionDialogRow title="View" className="items-start">
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
          </ActionDialogRow>
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
