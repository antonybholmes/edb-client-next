import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { Tabs } from '@/components/shadcn/ui/themed/tabs'
import { IOSTabsList } from '@/components/tabs/ios-tabs'
import { TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import {
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
      {/* <BaseCol className="bg-background p-4 rounded-lg"> */}
      <SwitchPropRow
        title="Labels"
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
      />

      <SwitchPropRow
        className="ml-4"
        title="Gene ID"
        disabled={!settings.genes.labels.show}
        checked={settings.genes.labels.showGeneId}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.genes.labels.showGeneId = v
          })

          updateSettings(newSettings)
        }}
      />

      <SwitchPropRow
        title={
          <>
            <ColorPickerButton
              color={settings.genes.stroke.color}
              disabled={!settings.genes.stroke.show}
              onColorChange={v => {
                // const newTrack = produce(_track, draft => {
                //   draft.displayOptions.stroke.color = v
                // })

                // callback?.(group, newTrack)
                // setTrack(newTrack)

                const newSettings = produce(settings, draft => {
                  draft.genes.stroke.color = v
                })

                updateSettings(newSettings)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Stroke color"
            />
            <span>Stroke</span>
          </>
        }
        checked={settings.genes.stroke.show}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.genes.stroke.show = v
          })

          updateSettings(newSettings)
        }}
      >
        <PropRow title="W">
          <NumericalInput
            id="line1-stroke-width"
            value={settings.genes.stroke.width}
            disabled={!settings.genes.stroke.show}
            placeholder="Stroke..."
            w="w-16"
            onNumChange={v => {
              // const newTrack = produce(_track, draft => {
              //   draft.displayOptions.stroke.width = v
              // })

              // callback?.(group, newTrack)
              // setTrack(newTrack)

              const newSettings = produce(settings, draft => {
                draft.genes.stroke.width = v
              })

              updateSettings(newSettings)
            }}
          />
        </PropRow>
      </SwitchPropRow>
      {/* <SwitchPropRow
        title="Exons"
        checked={_track.displayOptions.exons.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.exons.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      > */}

      <PropRow
        title={
          <>
            <ColorPickerButton
              color={settings.genes.exons.fill.color}
              disabled={!settings.genes.exons.fill.show}
              onColorChange={v => {
                // const newTrack = produce(_track, draft => {
                //   draft.displayOptions.exons.fill.color = v
                // })

                // callback?.(group, newTrack)
                // setTrack(newTrack)

                const newSettings = produce(settings, draft => {
                  draft.genes.exons.fill.color = v
                })

                updateSettings(newSettings)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Exon color"
            />
            <span>Exons</span>
          </>
        }
      >
        <PropRow title="H">
          <NumericalInput
            value={_track.displayOptions.transcripts.height}
            disabled={!settings.genes.exons.show}
            placeholder="Height..."
            w="w-16"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.transcripts.height = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </PropRow>

      {/* <SwitchPropRow
        title="Arrows"
        checked={_track.displayOptions.arrows.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.arrows.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      > */}

      <SwitchPropRow
        checked={settings.genes.arrows.show}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.genes.arrows.show = v
          })

          updateSettings(newSettings)
        }}
        title={
          <>
            <ColorPickerButton
              color={_track.displayOptions.arrows.stroke.color}
              disabled={!_track.displayOptions.arrows.stroke.show}
              onColorChange={v => {
                const newTrack = produce(_track, draft => {
                  draft.displayOptions.arrows.stroke.color = v
                })

                callback?.(group, newTrack)
                setTrack(newTrack)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Arrow color"
            />
            <span>Arrows</span>
          </>
        }
      >
        <PropRow title="W">
          <NumericalInput
            value={_track.displayOptions.arrows.x}
            placeholder="Width..."
            w="w-16"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.arrows.x = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />
        </PropRow>

        <PropRow title="H">
          <NumericalInput
            value={_track.displayOptions.arrows.y}
            placeholder="Height..."
            w="w-16"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.arrows.y = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </SwitchPropRow>
      <PropRow title="Display">
        <Select
          value={settings.genes.display}
          onValueChange={v => {
            const newSettings = produce(settings, draft => {
              draft.genes.display = v as GeneDisplay
            })

            updateSettings(newSettings)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Choose display" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dense">Dense</SelectItem>
            <SelectItem value="pack">Pack</SelectItem>
            <SelectItem value="full">Full</SelectItem>
          </SelectContent>
        </Select>
      </PropRow>
      <PropRow title="View">
        {/* <Select
          value={settings.genes.view}
          onValueChange={v => {
            const newSettings = produce(settings, draft => {
              draft.genes.view = v as GeneView
            })

            updateSettings(newSettings)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Choose view" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transcripts">Transcripts</SelectItem>
            <SelectItem value="exon">Exons</SelectItem>
          </SelectContent>
        </Select> */}

        <Tabs
          value={settings.genes.view}
          onValueChange={v => {
            const newSettings = produce(settings, draft => {
              draft.genes.view = v as GeneView
            })

            updateSettings(newSettings)
          }}
          className="text-xs"
        >
          <IOSTabsList
            defaultWidth="80px"
            value={settings.genes.view}
            tabs={[
              { id: 'transcript', name: 'Transcripts' },
              { id: 'exon', name: 'Exons' },
            ]}
          />
        </Tabs>
      </PropRow>
    </OKCancelDialog>
  )
}
