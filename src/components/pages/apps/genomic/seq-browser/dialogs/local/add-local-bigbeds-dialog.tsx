import { TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { VCenterCol } from '@components/layout/v-center-col'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { BigBed } from '@gmod/bbi'
import { COLOR_BLACK } from '@lib/color/color'
import { BlobFile } from 'generic-filehandle2'
import { useState } from 'react'

export interface IProps {
  callback?: (name: string, color: string, bigBeds: BigBed[]) => void
  onCancel: () => void
}

export function AddLocalBigBedsDialog({ callback, onCancel }: IProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_BLACK)
  const [error] = useState('')
  const [bigBeds, setBigWigs] = useState<BigBed[]>([])

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
      open={true}
      //buttons={[TEXT_OK]}
      title="Load BigBed Files From Device"
      bodyCls="gap-y-4"
      onResponse={(response) => {
        if (response === TEXT_OK) {
          if (bigBeds.length > 0) {
            callback?.(name, color, bigBeds)
          }
        } else {
          onCancel()
        }
      }}
      showClose={true}
      leftFooterChildren={
        <>{error && <span className="text-destructive">{error}</span>}</>
      }
      leftHeaderChildren={
        <ColorPickerButton
          color={color}
          onColorChange={setColor}
          className={SIMPLE_COLOR_EXT_CLS}
          title="Set color"
        />
      }
    >
      {/* <Input
        id="name"
        //variant="dialog"
        h="dialog"
        value={name}
        onChange={e => {
          setName(e.target.value)
        }}
        placeholder="Track name"
      /> */}

      <FileDropZonePanel
        fileTypes={{ 'application/octet-stream': ['.bb', '.bigBed'] }}
        onFileDrop={(files) => {
          if (files.length > 0) {
            setName(files.map((f) => f.name).join(', '))

            // const bw = new BigWig({
            //   filehandle: new BlobFile(files[0]!),
            // })

            setBigWigs(
              files.map((file) => {
                return new BigBed({
                  filehandle: new BlobFile(file),
                })
              })
            )
          }
        }}
      >
        <VCenterCol className="items-center h-32 border-2 border-dashed border-border rounded-theme pointer-events-none gap-y-4">
          {bigBeds.length > 0 ? (
            <>
              <span className="font-bold">{name}</span>
              <span>To replace, drag other BigBed files here.</span>
            </>
          ) : (
            <span>Drag BigBed files here.</span>
          )}
        </VCenterCol>
      </FileDropZonePanel>
    </OKCancelDialog>
  )
}
