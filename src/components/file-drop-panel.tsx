import { BaseCol } from '@layout/base-col'
import { Children, useEffect, useState } from 'react'

import { TEXT_DRAG_HERE } from '@/consts'
import { DRAG_OUTLINE_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import { PlusIcon } from './icons/plus-icon'
import { VCenterCol } from './layout/v-center-col'

const ANIMATION_DURATION_MS = 100

const FILE_DRAG_CLS = cn(
  'flex flex-col justify-center items-center w-full h-full absolute z-(--z-overlay) grow bg-background rounded-theme overflow-hidden trans-opacity backdrop-blur-sm items-center gap-y-2 p-2 text-center',
  DRAG_OUTLINE_CLS
)

export type FileDrop = (files: File[]) => void

export interface IFileDropProps {
  onFileDrop?: FileDrop | undefined
}

export interface IProps extends IDivProps, IFileDropProps {}

export function FileDrag({
  isDragging,
  className,
  onFileDrop,
  onDragLeave,
  ...props
}: IProps & { isDragging: boolean }) {
  const [animate, setAnimate] = useState(false)

  // UseEffect hook to trigger animation with delay because
  // css effects are a bit garbage and cannot be intially
  // delayed on mount
  //
  // isDragging && animate ensures that the initial state is transparent
  // when dragging and only after the timer completes after mounting
  // will it start to fade in. This just looks nicer
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true)
    }, ANIMATION_DURATION_MS)

    // Cleanup the timer if the component unmounts
    return () => clearTimeout(timer)
  }, [])

  return (
    <VCenterCol
      className={cn(
        FILE_DRAG_CLS,
        [isDragging && animate, 'opacity-100', 'opacity-0'],
        className
      )}
      data-drag={true}
      onDrop={event => {
        event.preventDefault()

        onFileDrop?.(Array.from(event.dataTransfer.files))
      }}
      onDragOver={event => {
        event.preventDefault()
      }}
      onDragEnter={event => {
        event.preventDefault()
      }}
      onDragLeave={event => {
        event.preventDefault()

        onDragLeave?.(event)
      }}
      {...props}
    >
      <div>{TEXT_DRAG_HERE}</div>
      <div className="bg-background border-2 border-foreground p-1 overflow-hidden rounded-full">
        <PlusIcon />
      </div>
    </VCenterCol>
  )
}

// export function FileDrag2({
//   isDragging,
//   className,
//   onFileDrop,
//   onDragLeave,
// }: IProps & { isDragging: boolean }) {
//   const [animate, setAnimate] = useState(false)

//   // const onDrop = useCallback((acceptedFiles: File[]) => {
//   //   console.log(acceptedFiles)
//   // }, [])

//   const { getRootProps, getInputProps } = useDropzone({
//     onDrop: files => {
//       onFileDrop?.(files)
//     },
//   })

//   // UseEffect hook to trigger animation with delay because
//   // css effects are a bit garbage and cannot be intially
//   // delayed on mount
//   //
//   // isDragging && animate ensures that the initial state is transparent
//   // when dragging and only after the timer completes after mounting
//   // will it start to fade in. This just looks nicer
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setAnimate(true)
//     }, ANIMATION_DURATION_MS)

//     // Cleanup the timer if the component unmounts
//     return () => clearTimeout(timer)
//   }, [])

//   const mainCls = cn(
//     FILE_DRAG_CLS,
//     [isDragging && animate, 'opacity-100', 'opacity-0'],
//     className
//   )

//   return (
//     <div
//       {...getRootProps({ className: mainCls, onDragLeave, 'data-drag': true })}
//       id={makeRandId('drag-panel')}
//     >
//       <input {...getInputProps()} />
//       <div>{TEXT_DRAG_HERE}</div>
//       <div className="bg-background border-2 border-foreground p-1 overflow-hidden rounded-full">
//         <PlusIcon />
//       </div>
//     </div>
//   )
// }

export function FileDropPanel({
  onFileDrop = undefined,
  className,
  children,
}: IProps) {
  const [registerDragging, setRegisterDragging] = useState(false)

  const [isDragging, setIsDragging] = useState(false)

  const c = Children.toArray(children)

  const dragComp =
    c.length > 1 ? (
      c[1]
    ) : (
      // this allows us to add a fade in out delay since isdragging
      // will be true or false immediately so FileDrag can animate,
      // but the component is only removed when isDragging becomes
      // false which is controlled by a timer below, hence FileDrag
      // has time to do an outro animation before being unmounted
      <FileDrag
        isDragging={registerDragging && isDragging}
        onFileDrop={_onFileDrop}
        onDragLeave={_onDragLeave}
      />
    )

  function _onDragLeave() {
    setRegisterDragging(false)

    setTimeout(() => {
      setIsDragging(false)
    }, ANIMATION_DURATION_MS)
  }

  function _onFileDrop(files: File[]) {
    console.log('drag over')
    _onDragLeave()
    onFileDrop?.(files)
  }

  return (
    <BaseCol
      onDrop={event => {
        event.preventDefault()
      }}
      onDragOver={event => {
        event.preventDefault()
      }}
      onDragEnter={event => {
        if (isDragging) {
          return
        }
        event.preventDefault()
        setIsDragging(true)
        setRegisterDragging(true)
      }}
      onDragLeave={event => {
        event.preventDefault()
      }}
      className={cn('grow relative', className)}
    >
      {/* {isDragging ? dragComp : c[0]} */}
      <>
        {isDragging && dragComp}
        {c[0]}
      </>
    </BaseCol>
  )
}
