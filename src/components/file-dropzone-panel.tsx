import { BaseCol } from '@layout/base-col'
import { Children, useCallback } from 'react'

import { TEXT_DRAG_HERE } from '@/consts'
import { DRAG_OUTLINE_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import { useDropzone, type Accept } from 'react-dropzone'
import { PlusIcon } from './icons/plus-icon'
import { VCenterCol } from './layout/v-center-col'

const FILE_DRAG_CLS = cn(
  'flex flex-col justify-center items-center top-0 left-0 w-full h-full absolute z-(--z-overlay)',
  'grow trans-opacity backdrop-blur-sm items-center gap-y-2 p-2 text-center',
  DRAG_OUTLINE_CLS
)

export type FileDrop = (files: File[]) => void

export interface IFileDropProps {
  onFileDrop?: FileDrop | undefined
}

export interface IProps extends IDivProps, IFileDropProps {}

export function FileDrag() {
  return (
    <VCenterCol
      className={FILE_DRAG_CLS}
      data-drag={true}
      // className={cn(
      //   FILE_DRAG_CLS,
      //   [isDragging && animate, 'opacity-100', 'opacity-0'],
      //   className
      // )}

      // onDrop={event => {
      //   event.preventDefault()

      //   onFileDrop?.(Array.from(event.dataTransfer.files))
      // }}
      // onDragOver={event => {
      //   event.preventDefault()
      // }}
      // onDragEnter={event => {
      //   event.preventDefault()
      // }}
      // onDragLeave={event => {
      //   event.preventDefault()

      //   onDragLeave?.(event)
      // }}
      // {...props}
    >
      <div>{TEXT_DRAG_HERE}</div>
      <div className="bg-background overflow-hidden rounded-full">
        <PlusIcon fill="white" />
      </div>
    </VCenterCol>
  )
}

export interface IFileDropProps {
  fileTypes?: Accept
  onFileDrop?: FileDrop | undefined
}

export interface IProps extends IDivProps, IFileDropProps {}

export function FileDropZonePanel({
  fileTypes = {},
  onFileDrop = undefined,
  className,
  children,
}: IProps) {
  const c = Children.toArray(children)

  const dragComp = c.length > 1 ? c[1] : <FileDrag />

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Handle the accepted files
    // acceptedFiles.forEach(file => {
    //   console.log(file)
    // })

    onFileDrop?.(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    accept: fileTypes,
    onDrop,
  })

  return (
    <BaseCol {...getRootProps({ className: cn('grow relative', className) })}>
      <input {...getInputProps()} aria-label="Drop files here" />
      {isDragActive && dragComp}
      {c[0]}
    </BaseCol>
  )
}
