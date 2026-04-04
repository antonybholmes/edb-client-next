import { SIMPLE_COLOR_EXT_CLS } from '@/components/color/color-picker-button'
import { ColorPropRow } from '@/components/dialog/color-prop-row'
import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/shadcn/ui/themed/v2/radio-group'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { PropRow } from '@/dialog/prop-row'
import { SwitchPropRow } from '@/dialog/switch-prop-row'
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

export interface IProps {
  group: ITrackGroup
  track: IGeneTrack
  callback?: (group: ITrackGroup, track: IGeneTrack) => void

  onCancel: () => void
}

export function GenesEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)
  const { settings, updateSettings } = useSeqBrowserSettings()

  // const [showAxes, setShowAxes] = useState(true)

  // const [strokeShow, setStrokeShow] = useState(true)
  // const [strokeWidth, setStrokeWidth] = useState(0)
  // const [strokeColor, setStrokeColor] = useState(COLOR_BLACK) //`#${Math.floor(Math.random() * 16777215).toString(16)}`,

  // const [fillShow, setFillShow] = useState(true)
  // const [fillOpacity, setFillOpacity] = useState(0)
  // const [fillColor, setFillColor] = useState(COLOR_BLACK)

  // useEffect(() => {
  //   // if group provided, set defaults

  //   setName(_track.name)

  //   setShowAxes(_track.displayOptions.axes.show)

  //   setStrokeShow(_track.displayOptions.stroke.show)
  //   setStrokeWidth(_track.displayOptions.stroke.width)
  //   setStrokeColor(_track.displayOptions.stroke.color)

  //   setFillShow(_track.displayOptions.fill.show)
  //   setFillOpacity(_track.displayOptions.fill.opacity)
  //   setFillColor(_track.displayOptions.fill.color)
  // }, [track])

  // function updateTrack() {
  //   // return modified group
  //   callback?.({
  //     ...track,
  //     name,
  //     displayOptions: {
  //       ..._track.displayOptions,
  //       axes: { ..._track.displayOptions.axes, show: showAxes },
  //       stroke: {
  //         ..._track.displayOptions.stroke,
  //         show: strokeShow,
  //         width: strokeWidth,
  //         color: strokeColor,
  //       },
  //       fill: {
  //         ..._track.displayOptions.fill,
  //         show: fillShow,
  //         opacity: fillOpacity,
  //         color: fillColor,
  //       },
  //     },
  //   })
  // }

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title={_track.name}
      onResponse={() => {
        onCancel()
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      //overlayColor="trans"
    >
      <ScrollAccordion
        value={['labels', 'genes', 'canonical-genes', 'display-density']}
        variant="settings"
        className="h-80"
      >
        <SettingsAccordionItem
          title="Labels"
          description="Configure how genes are labelled"
          showBorder={false}
        >
          <SwitchPropRow
            title="Show labels"
            side="right"
            checked={settings.genes.labels.show}
            onCheckedChange={v => {
              // const newTrack = produce(_track, draft => {
              //   draft.displayOptions.labels.show = v
              // })

              // callback?.(group, newTrack)
              // setTrack(newTrack)

              const newSettings = produce(settings, draft => {
                draft.genes.labels.show = v
              })

              updateSettings(newSettings)
            }}
            className="grow"
          />

          <SwitchPropRow
            title="Add gene Id"
            side="right"
            disabled={!settings.genes.labels.show}
            checked={settings.genes.labels.showGeneId}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.labels.showGeneId = v
              })

              updateSettings(newSettings)
            }}
            className="grow ml-4"
          />
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Genes"
          description="Customize the appearance of genes."
        >
          <SwitchPropRow
            checked={settings.genes.stroke.show}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.stroke.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Stroke"
                side="left"
                color={settings.genes.stroke.color}
                onColorChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.stroke.color = v
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="W">
              <NumericalInput
                value={settings.genes.stroke.width}
                disabled={!settings.genes.stroke.show}
                placeholder="Stroke..."
                w="xxs"
                onNumChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.stroke.width = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.genes.exons.show}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.exons.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Exons"
                side="left"
                color={settings.genes.exons.fill.color}
                onColorChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.exons.fill.color = v
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.genes.exons.height}
                disabled={!settings.genes.exons.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.exons.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.genes.cds.show}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.cds.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="CDS"
                side="left"
                color={settings.genes.cds.fill.color}
                onColorChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.cds.fill.color = v
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.genes.cds.height}
                disabled={!settings.genes.cds.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.cds.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.genes.utrs.show}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.utrs.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="UTRs"
                side="left"
                color={settings.genes.utrs.fill.color}
                onColorChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.utrs.fill.color = v
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          >
            <LabelContainer label="H">
              <NumericalInput
                value={settings.genes.utrs.height}
                disabled={!settings.genes.utrs.show}
                placeholder="Height..."
                w="xxs"
                onNumChange={v => {
                  const newSettings = produce(settings, draft => {
                    draft.genes.utrs.height = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </LabelContainer>
          </SwitchPropRow>

          <SwitchPropRow
            checked={settings.genes.arrows.show}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.arrows.show = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Arrows"
                side="left"
                color={_track.displayOptions.arrows.stroke.color}
                onColorChange={v => {
                  const newTrack = produce(_track, draft => {
                    draft.displayOptions.arrows.stroke.color = v
                  })

                  callback?.(group, newTrack)
                  setTrack(newTrack)
                }}
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
              onNumChange1={v => {
                const newTrack = produce(_track, draft => {
                  draft.displayOptions.arrows.x = v
                })

                callback?.(group, newTrack)
                setTrack(newTrack)
              }}
              onNumChange2={v => {
                const newTrack = produce(_track, draft => {
                  draft.displayOptions.arrows.y = v
                })

                callback?.(group, newTrack)
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
            checked={settings.genes.canonical.isColored}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.canonical.isColored = v
              })

              updateSettings(newSettings)
            }}
            side="right"
            title={
              <ColorPropRow
                title="Highlight canonical genes"
                side="left"
                color={settings.genes.canonical.fill.color}
                onColorChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.canonical.fill.color = v
                    })
                  )
                }}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            }
          />

          <SwitchPropRow
            checked={settings.genes.canonical.only}
            onCheckedChange={v => {
              const newSettings = produce(settings, draft => {
                draft.genes.canonical.only = v
              })

              updateSettings(newSettings)
            }}
            title="Only show canonical genes"
            side="right"
            className="ml-4"
          />
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Display density"
          description="Control the appearance of genes to affect the display density."
        >
          <PropRow title="Display">
            <SelectList
              value={settings.genes.display}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.genes.display = v as GeneDisplay
                })

                updateSettings(newSettings)
              }}
              // so items appear formatted
              items={GENE_DISPLAY_OPTIONS}
            >
              {GENE_DISPLAY_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectList>
          </PropRow>
          <PropRow title="View" className="items-start">
            <RadioGroup
              value={settings.genes.view}
              onValueChange={v => {
                const newSettings = produce(settings, draft => {
                  draft.genes.view = v as GeneView
                })

                updateSettings(newSettings)
              }}
              className="text-xs flex flex-col gap-y-2"
            >
              <RadioGroupItem value="transcript">Transcripts</RadioGroupItem>
              <RadioGroupItem value="features">Features</RadioGroupItem>
            </RadioGroup>
          </PropRow>
        </SettingsAccordionItem>
      </ScrollAccordion>
    </OKCancelDialog>
  )
}
