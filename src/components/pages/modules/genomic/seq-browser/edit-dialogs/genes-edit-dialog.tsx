import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { PropRow } from '@/components/prop-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { SwitchPropRow } from '@/components/switch-prop-row'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { produce } from 'immer'
import { useState } from 'react'
import type { IGeneTrack, ITrackGroup } from '../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: IGeneTrack
  callback?: (group: ITrackGroup, track: IGeneTrack) => void

  onCancel: () => void
}

export function GenesEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)

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
      onReponse={() => {
        onCancel()
      }}
      //contentVariant="glass"
    >
      {/* <BaseCol className="bg-background p-4 rounded-lg"> */}
      <SwitchPropRow
        title="Labels"
        checked={_track.displayOptions.labels.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.labels.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      />

      <SwitchPropRow
        title="Stroke"
        checked={_track.displayOptions.stroke.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.stroke.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
        rightChildren={
          <ColorPickerButton
            color={_track.displayOptions.stroke.color}
            disabled={!_track.displayOptions.stroke.show}
            onColorChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.stroke.color = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Stroke color"
          />
        }
      >
        <PropRow title="W" className="ml-2">
          <NumericalInput
            id="line1-stroke-width"
            value={_track.displayOptions.stroke.width}
            disabled={!_track.displayOptions.stroke.show}
            placeholder="Stroke..."
            className="w-16 rounded-theme"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.stroke.width = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
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
        title="Exons"
        leftChildren={
          <ColorPickerButton
            color={_track.displayOptions.exons.fill.color}
            disabled={!_track.displayOptions.exons.fill.show}
            onColorChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.exons.fill.color = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Stroke color"
          />
        }
      >
        <PropRow title="H">
          <NumericalInput
            value={_track.displayOptions.exons.height}
            disabled={!_track.displayOptions.exons.show}
            placeholder="Height..."
            className="w-16 rounded-theme"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.exons.height = v
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

      <PropRow
        title="Arrows"
        leftChildren={
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
            title="Stroke color"
          />
        }
      >
        {/* <PropRow title="Style">
          <Select
            value={_track.displayOptions.arrows.style}
            onValueChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.arrows.style = v as GeneArrowStyle
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          >
            <SelectTrigger className="w-24">
              <SelectValue placeholder="Choose title position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lines">Lines</SelectItem>
              <SelectItem value="Filled">Filled</SelectItem>
            </SelectContent>
          </Select>
        </PropRow> */}

        <PropRow title="W">
          <NumericalInput
            value={_track.displayOptions.arrows.x}
            placeholder="Width..."
            className="w-16 rounded-theme"
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
            className="w-16 rounded-theme"
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.arrows.y = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </PropRow>
      {/* </BaseCol> */}
    </OKCancelDialog>
  )
}
