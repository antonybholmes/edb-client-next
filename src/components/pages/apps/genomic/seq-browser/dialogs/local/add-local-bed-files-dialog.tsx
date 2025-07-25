import { TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { VCenterCol } from '@components/layout/v-center-col'
import { onTextFileChange } from '@components/pages/open-files'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { COLOR_BLACK } from '@lib/color/color'
import { indexBed } from '@lib/genomic/bed'
import type { GenomicLocation } from '@lib/genomic/genomic'
import type { GenomicFeatureIndex } from '@lib/genomic/genomic-index'
import { textToLines } from '@lib/text/lines'
import { useState } from 'react'

export interface IProps {
  callback?: (
    color: string,
    indexes: GenomicFeatureIndex<GenomicLocation>[]
  ) => void
  onCancel: () => void
}

export function AddLocalBedFilesDialog({ callback, onCancel }: IProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_BLACK)
  const [error, setError] = useState('')
  const [lines, setLines] = useState<string[][]>([])
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
      title="Load BED Files From Device"
      bodyCls="gap-y-4"
      onResponse={response => {
        if (response === TEXT_OK) {
          if (lines.length === 0) {
            setError('This file appears to be empty')
            return
          }

          const indexes = lines
            .map(l => indexBed(name, l))
            .filter(i => i !== null) as GenomicFeatureIndex<GenomicLocation>[]

          callback?.(color, indexes)
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
        onFileDrop={files => {
          if (files.length > 0) {
            onTextFileChange('Open filter list', files, files => {
              if (files.length > 0) {
                setName(files.map(f => f.name).join(', '))
                setLines(files.map(f => textToLines(f.text)))
              }
            })
          }
        }}
      >
        <VCenterCol className="items-center h-32 border-2 border-dashed border-border rounded-theme pointer-events-none gap-y-4">
          {lines.length > 0 ? (
            <>
              <span className="font-bold">{name}</span>
              <span>
                {`This file contains ${lines[0]!.length.toLocaleString()} locations. To replace, drag other BED files here.`}
              </span>
            </>
          ) : (
            <span>Drag BED files here.</span>
          )}
        </VCenterCol>
      </FileDropZonePanel>
    </OKCancelDialog>
  )
}
