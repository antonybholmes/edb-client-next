import { TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { FileDropZonePanel } from '@components/file-dropzone-panel'
import { VCenterCol } from '@components/layout/v-center-col'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { BigBed, BigWig } from '@gmod/bbi'
import { COLOR_BLACK } from '@lib/color/color'
import { indexBed } from '@lib/genomic/bed'
import type { IGenomicLocation } from '@lib/genomic/genomic'
import type { GenomicFeatureIndex } from '@lib/genomic/genomic-index'
import { textToLines } from '@lib/text/lines'
import { BlobFile } from 'generic-filehandle2'
import { useState } from 'react'

export type LocalFileType =
  | GenomicFeatureIndex<IGenomicLocation>
  | BigWig
  | BigBed

export interface ILocalFile {
  name: string
  data: LocalFileType
}

export interface IProps {
  callback?: (name: string, color: string, files: ILocalFile[]) => void
  onCancel: () => void
}

export function AddLocalFilesDialog({ callback, onCancel }: IProps) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLOR_BLACK)
  const [error, setError] = useState('')
  const [files, setFiles] = useState<ILocalFile[]>([])

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
      title="Load Files From Device"
      bodyCls="gap-y-4"
      onResponse={response => {
        if (response === TEXT_OK) {
          if (files.length > 0) {
            callback?.(name, color, files)
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
        fileTypes={{
          'text/plain': ['.bed'],
          'application/octet-stream': ['.bw', '.bigWig', '.bb', '.bigBed'],
        }}
        onFileDrop={async files => {
          console.log('files', files)

          if (files.length > 0) {
            console.log('files', files)
            setName(files.map(f => f.name).join(', '))

            // const bw = new BigWig({
            //   filehandle: new BlobFile(files[0]!),
            // })

            const ret: ILocalFile[] = []

            for (const file of files) {
              switch (file.name.split('.').pop()?.toLowerCase()) {
                case 'bb':
                case 'bigbed':
                  ret.push({
                    name: file.name,
                    data: new BigBed({
                      filehandle: new BlobFile(file),
                    }),
                  })
                  break
                case 'bw':
                case 'bigwig':
                  ret.push({
                    name: file.name,
                    data: new BigWig({
                      filehandle: new BlobFile(file),
                    }),
                  })
                  break
                default:
                  // Handle BED files
                  ret.push({
                    name: file.name,
                    data: indexBed(name, textToLines(await file.text()))!,
                  })
                  break
              }
            }

            setFiles(ret)
          }
        }}
      >
        <VCenterCol className="items-center h-32 border-2 border-dashed border-border rounded-theme pointer-events-none gap-y-4">
          {files.length > 0 ? (
            <>
              <span className="font-bold text-center">{name}</span>
              <span className="text-center">
                To replace, drag other BED, BigWig, or BigBed files here.
              </span>
            </>
          ) : (
            <span>Drag BED, BigWig, or BigBed files here.</span>
          )}
        </VCenterCol>
      </FileDropZonePanel>
    </OKCancelDialog>
  )
}
