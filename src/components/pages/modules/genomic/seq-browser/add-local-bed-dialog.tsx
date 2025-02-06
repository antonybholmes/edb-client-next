import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { FileDropPanel } from '@/components/file-drop-panel'
import { VCenterRow } from '@/components/layout/v-center-row'
import { onTextFileChange } from '@/components/pages/open-files'
import { Input5 } from '@/components/shadcn/ui/themed/input5'
import { COLOR_BLACK, TEXT_OK } from '@/consts'
import { indexBed } from '@/lib/genomic/bed'
import type { IGenomicLocation } from '@/lib/genomic/genomic'
import type { GenomicFeatureIndex } from '@/lib/genomic/genomic-index'
import { textToLines } from '@/lib/text/lines'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { useState } from 'react'

export interface IProps {
  callback?: (
    color: string,
    index: GenomicFeatureIndex<IGenomicLocation>
  ) => void
  onCancel: () => void
}

export function AddLocalBedDialog({ callback, onCancel }: IProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_BLACK)
  const [error, setError] = useState('')
  const [lines, setLines] = useState<string[]>([])
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
      title={`Load BED file`}
      onReponse={(response) => {
        if (response === TEXT_OK) {
          if (lines.length === 0) {
            setError('This file appears to be empty')
            return
          }

          const index = indexBed(name, lines)

          if (index === null) {
            setError('Malformed bed file')
            return
          }

          callback?.(color, index)
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
          title="Set group color"
        />
      }
    >
      <Input5
        id="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          // const newTrack = {
          //   ...track,
          //   name: e.target.value,
          // }
          // callback?.(newTrack)
          // setName(newTrack)
        }}
        placeholder="Track name"
      />

      <FileDropPanel
        onFileDrop={(files) => {
          if (files.length > 0) {
            onTextFileChange('Open filter list', files, (files) => {
              if (files.length > 0) {
                setName(files[0]!.name.split('.')[0]!)
                setLines(textToLines(files[0]!.text))
              }
            })
          }
        }}
      >
        <VCenterRow className="justify-center h-24 border-2 border-dashed border-border rounded-theme pointer-events-none">
          {lines.length > 0
            ? `Contains ${lines.length.toLocaleString()} lines`
            : 'Drag BED file here'}
        </VCenterRow>
      </FileDropPanel>
    </OKCancelDialog>
  )
}
